import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApiClient, setApiConfig } from "./client";
import { ApiError } from "./errors";

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>;

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

let fetchMock: FetchMock;

const lastRequest = () => {
  const [url, init] = fetchMock.mock.lastCall as [string, RequestInit];
  return { url, init, headers: init.headers as Headers };
};

beforeEach(() => {
  fetchMock = vi
    .fn<typeof fetch>()
    .mockImplementation(() => Promise.resolve(jsonResponse({ ok: true })));
  vi.stubGlobal("fetch", fetchMock);
  setApiConfig({ baseURL: "https://api.test", headers: undefined });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const client = createApiClient(() => "tok");

describe("createApiClient", () => {
  it("keeps headers given in tuple form and layers global, per-request and token", async () => {
    setApiConfig({ baseURL: "https://api.test", headers: { "X-Tenant": "acme", "X-Global": "g" } });

    await client({
      url: "/items",
      method: "GET",
      headers: [
        ["X-Tenant", "override"],
        ["Accept-Language", "de"],
      ],
    });

    const { headers } = lastRequest();
    expect(headers.get("X-Tenant")).toBe("override");
    expect(headers.get("X-Global")).toBe("g");
    expect(headers.get("Accept-Language")).toBe("de");
    expect(headers.get("Authorization")).toBe("Bearer tok");
  });

  it("omits the query separator when no params survive normalization", async () => {
    await client({ url: "/items", method: "GET", params: { page: undefined } });
    expect(lastRequest().url).toBe("https://api.test/items");

    await client({ url: "/items", method: "GET", params: { ids: [1, 2], q: null } });
    expect(lastRequest().url).toBe("https://api.test/items?ids=1&ids=2&q=null");
  });

  it("form-encodes objects with repeated array keys and drops nulls", async () => {
    await client({
      url: "/token",
      method: "POST",
      headers: { "Content-Type": "Application/X-WWW-Form-Urlencoded" },
      data: { scope: ["read", "write"], note: null, grant: "pw" },
    });

    const { init } = lastRequest();
    expect(init.body).toBeInstanceOf(URLSearchParams);
    expect([...(init.body as URLSearchParams)]).toEqual([
      ["scope", "read"],
      ["scope", "write"],
      ["grant", "pw"],
    ]);
  });

  it("sends JSON with a JSON content type by default and serializes bigint", async () => {
    await client({ url: "/items", method: "POST", data: { id: 1n, name: "a" } });

    const { init, headers } = lastRequest();
    expect(init.body).toBe('{"id":"1","name":"a"}');
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("passes raw bodies through and lets fetch own the multipart header", async () => {
    const form = new FormData();
    await client({
      url: "/upload",
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      data: form,
    });
    expect(lastRequest().init.body).toBe(form);
    expect(lastRequest().headers.get("Content-Type")).toBeNull();

    const blob = new Blob(["x"]);
    await client({ url: "/raw", method: "PUT", data: blob });
    expect(lastRequest().init.body).toBe(blob);

    await client({
      url: "/note",
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      data: "hello",
    });
    expect(lastRequest().init.body).toBe("hello");
  });

  it("raises an ApiError for a non-JSON error page instead of a parse error", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("<html>Bad Gateway</html>", {
        status: 502,
        statusText: "Bad Gateway",
        headers: { "Content-Type": "text/html" },
      }),
    );

    const error = await client({ url: "/items", method: "GET" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
  });

  it("uses the server message for JSON errors", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ Message: "Nope" }, { status: 400, statusText: "Bad Request" }),
    );

    await expect(client({ url: "/items", method: "GET" })).rejects.toMatchObject({
      status: 400,
      message: "Nope",
    });
  });

  it("treats 304 as a body-less success", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 304 }));

    await expect(client({ url: "/items", method: "GET" })).resolves.toMatchObject({
      status: 304,
      data: {},
    });
  });
});
