import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  configureApiClient,
} from "../src";
import { client } from "./gen/.kubb/client";
import { deleteApiProjectsId } from "./gen/calls/deleteApiProjectsId";
import { getApiProjects } from "./gen/calls/getApiProjects";
import { getApiProjectsId } from "./gen/calls/getApiProjectsId";
import { postApiExportsExcel } from "./gen/calls/postApiExportsExcel";

const fetchMock = vi.fn<typeof fetch>();

let token: string | null = "tok";
let dispose: () => void;

function respond(body: BodyInit | null, init?: ResponseInit) {
  fetchMock.mockResolvedValueOnce(new Response(body, init));
}

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

function lastRequest(): Request {
  const [request] = fetchMock.mock.lastCall ?? [];

  return request as Request;
}

beforeEach(() => {
  token = "tok";
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse({ id: 1, name: "Fixture" }));
  vi.stubGlobal("fetch", fetchMock);
  dispose = configureApiClient(client, {
    baseURL: "https://api.test",
    getToken: () => token,
  });
});

afterEach(() => {
  dispose();
  vi.unstubAllGlobals();
});

describe("configureApiClient", () => {
  it("prefixes the base URL and serializes query params", async () => {
    await getApiProjects({ query: { page: 2, orderBy: "name" } });

    expect(lastRequest().url).toBe("https://api.test/api/projects?page=2&orderBy=name");
  });

  it("sends the token as a Bearer header, replacing a configured one of any casing", async () => {
    const scoped = client.createClient({ headers: { authorization: "Bearer stale" } });
    const disposeScoped = configureApiClient(scoped, {
      baseURL: "https://api.test",
      getToken: () => token,
    });

    await getApiProjectsId({ path: { id: 7 }, client: scoped });
    disposeScoped();

    expect(lastRequest().headers.get("Authorization")).toBe("Bearer tok");
  });

  it("omits the header when there is no token", async () => {
    token = null;
    await getApiProjectsId({ path: { id: 7 } });

    expect(lastRequest().headers.get("Authorization")).toBeNull();
  });

  it("drops a configured token once the callback stops returning one", async () => {
    const scoped = client.createClient({ headers: { Authorization: "Bearer stale" } });
    const disposeScoped = configureApiClient(scoped, {
      baseURL: "https://api.test",
      getToken: () => token,
    });

    token = null;
    await getApiProjectsId({ path: { id: 7 }, client: scoped });
    disposeScoped();

    expect(lastRequest().headers.get("Authorization")).toBeNull();
  });

  it("keeps a caller-supplied abort signal", async () => {
    const controller = new AbortController();

    await getApiProjectsId({ path: { id: 7 }, options: { signal: controller.signal } });
    controller.abort();

    expect(lastRequest().signal.aborted).toBe(true);
  });

  it("maps error statuses onto the narrowest error class", async () => {
    respond(JSON.stringify({ Message: "Gone" }), {
      status: 404,
      statusText: "Not Found",
      headers: { "Content-Type": "application/json" },
    });

    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toThrowError(
      new NotFoundError("Gone"),
    );

    respond(JSON.stringify({ Message: "Nope" }), {
      status: 401,
      headers: { "Content-Type": "application/problem+json" },
    });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );

    respond(JSON.stringify({ Message: "Invalid" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("reads the message from a problem document, detail before title", async () => {
    respond(
      JSON.stringify({
        type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
        title: "Unauthorized",
        status: 401,
        detail: "Invalid username or password.",
      }),
      { status: 401, headers: { "Content-Type": "application/problem+json" } },
    );
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toThrowError(
      new UnauthorizedError("Invalid username or password."),
    );

    respond(JSON.stringify({ title: "Server exploded", status: 500, detail: "" }), {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "Content-Type": "application/problem+json" },
    });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toThrowError(
      new ApiError(500, "INTERNAL_SERVER_ERROR", "Server exploded"),
    );
  });

  it("falls back to a generic message for an error page with no JSON body", async () => {
    respond("<html>Bad Gateway</html>", {
      status: 502,
      statusText: "Bad Gateway",
      headers: { "Content-Type": "text/html" },
    });

    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toThrowError(
      new ApiError(502, "BAD_GATEWAY", "An error has occurred."),
    );
  });

  it("reads binary responses as a blob and keeps the response headers", async () => {
    respond("workbook-bytes", {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="report.xlsx"',
      },
    });

    const result = await postApiExportsExcel({ body: { projectId: 1 } });

    expect(result.data).toBeInstanceOf(Blob);
    expect(await result.data.text()).toBe("workbook-bytes");
    expect(result.response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="report.xlsx"',
    );
  });

  it("resolves empty responses with undefined", async () => {
    respond(null, { status: 204 });
    await expect(deleteApiProjectsId({ path: { id: 7 } }).unwrap()).resolves.toBeUndefined();

    respond("", { status: 200 });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).resolves.toBeUndefined();
  });

  it("stops touching requests once disposed", async () => {
    dispose();
    dispose = () => {};

    respond(JSON.stringify({ Message: "Gone" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });

    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.not.toBeInstanceOf(
      ApiError,
    );
    expect(lastRequest().headers.get("Authorization")).toBeNull();
  });
});
