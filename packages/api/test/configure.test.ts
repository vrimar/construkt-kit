import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  configureApiClient,
} from "../src";
import { client } from "./gen/.kubb/client";
import { getApiProjects } from "./gen/calls/getApiProjects";
import { getApiProjectsId } from "./gen/calls/getApiProjectsId";

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

  it("sends an object query param without a style in bracket form", async () => {
    await getApiProjects({ query: { filters: { status: ["open", "closed"], name: ["a b"] } } });

    expect(new URL(lastRequest().url).search).toBe(
      "?filters%5Bstatus%5D=open&filters%5Bstatus%5D=closed&filters%5Bname%5D=a%20b",
    );
  });

  it("sends a styled query param by its style", async () => {
    await getApiProjects({ query: { ids: [1, 2], page: 1 } });

    expect(new URL(lastRequest().url).search).toBe("?ids=1,2&page=1");
  });

  it("drops trailing slashes from the base URL", async () => {
    const scoped = client.createClient();
    const disposeScoped = configureApiClient(scoped, {
      baseURL: "https://api.test/v1//",
      getToken: () => token,
    });

    await getApiProjects({ client: scoped });
    disposeScoped();

    expect(lastRequest().url).toBe("https://api.test/v1/api/projects");
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

  it("derives the error code from the status alone, as over HTTP/2", async () => {
    respond(JSON.stringify({ detail: "Name taken" }), {
      status: 409,
      statusText: "",
      headers: { "Content-Type": "application/problem+json" },
    });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Name taken",
    });

    respond(null, { status: 409, statusText: "Duplicate Name" });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toMatchObject({
      code: "CONFLICT",
    });

    respond(null, { status: 499, statusText: "Client Closed Request" });
    await expect(getApiProjectsId({ path: { id: 7 } }).unwrap()).rejects.toMatchObject({
      status: 499,
      code: "HTTP_499",
    });
  });

  it("passes a failure without a response through unchanged", async () => {
    const failure = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValueOnce(failure);

    await expect(getApiProjectsId({ path: { id: 7 } })).rejects.toBe(failure);
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
