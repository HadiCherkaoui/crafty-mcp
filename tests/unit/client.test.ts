import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CraftyClient } from "../../src/client.js";
import { CraftyApiError } from "../../src/types.js";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function mockResponse(body: unknown, status = 200) {
  return {
    status,
    json: async () => body,
  } as Response;
}

function okResponse(data: unknown) {
  return mockResponse({ status: "ok", data });
}

function errorResponse(error: string, errorData?: string, status = 400) {
  return mockResponse({ status: "error", error, error_data: errorData }, status);
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

describe("CraftyClient", () => {
  const mockFetch = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env["NODE_TLS_REJECT_UNAUTHORIZED"];
  });

  // ---- constructor ----

  describe("constructor", () => {
    it("strips trailing slashes from baseUrl", async () => {
      mockFetch.mockResolvedValueOnce(okResponse([]));
      const client = new CraftyClient({
        baseUrl: "https://crafty.test///",
        apiToken: "tok",
        allowInsecure: false,
        timeout: 5000,
      });
      await client.get("/servers");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://crafty.test/api/v2/servers",
        expect.anything()
      );
    });

    it("sets NODE_TLS_REJECT_UNAUTHORIZED=0 when allowInsecure=true", () => {
      new CraftyClient({
        baseUrl: "https://crafty.test",
        apiToken: "tok",
        allowInsecure: true,
        timeout: 5000,
      });
      expect(process.env["NODE_TLS_REJECT_UNAUTHORIZED"]).toBe("0");
    });

    it("does not set NODE_TLS_REJECT_UNAUTHORIZED when allowInsecure=false", () => {
      new CraftyClient({
        baseUrl: "https://crafty.test",
        apiToken: "tok",
        allowInsecure: false,
        timeout: 5000,
      });
      expect(process.env["NODE_TLS_REJECT_UNAUTHORIZED"]).toBeUndefined();
    });
  });

  // ---- request helpers ----

  describe("HTTP methods", () => {
    let client: CraftyClient;

    beforeEach(() => {
      client = new CraftyClient({
        baseUrl: "https://crafty.test",
        apiToken: "test-token",
        allowInsecure: false,
        timeout: 5000,
      });
    });

    it("GET — uses GET method and correct URL", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ servers: [] }));
      await client.get("/servers");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://crafty.test/api/v2/servers",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("POST — serialises body to JSON", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ id: 1 }));
      await client.post("/servers", { name: "test" });
      const [, init] = mockFetch.mock.calls[0]!;
      expect((init as RequestInit).body).toBe('{"name":"test"}');
      expect(((init as RequestInit).headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json"
      );
    });

    it("PATCH — uses PATCH method", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null));
      await client.patch("/servers/1", { name: "new" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: "PATCH" })
      );
    });

    it("DELETE — passes body", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null));
      await client.delete("/files", { file_system_objects: [{ filename: "a.txt" }] });
      const [, init] = mockFetch.mock.calls[0]!;
      expect((init as RequestInit).method).toBe("DELETE");
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({
        file_system_objects: [{ filename: "a.txt" }],
      });
    });

    it("injects Authorization header on every request", async () => {
      mockFetch.mockResolvedValueOnce(okResponse([]));
      await client.get("/servers");
      const [, init] = mockFetch.mock.calls[0]!;
      expect(((init as RequestInit).headers as Record<string, string>)["Authorization"]).toBe(
        "Bearer test-token"
      );
    });

    it("returns unwrapped .data field", async () => {
      const payload = [{ server_id: "abc" }];
      mockFetch.mockResolvedValueOnce(okResponse(payload));
      const result = await client.get("/servers");
      expect(result).toEqual(payload);
    });
  });

  // ---- error handling ----

  describe("error handling", () => {
    let client: CraftyClient;

    beforeEach(() => {
      client = new CraftyClient({
        baseUrl: "https://crafty.test",
        apiToken: "tok",
        allowInsecure: false,
        timeout: 5000,
      });
    });

    it("throws CraftyApiError when status=error", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse("NOT_AUTHORIZED", "bad token", 401));
      await expect(client.get("/servers")).rejects.toBeInstanceOf(CraftyApiError);
    });

    it("CraftyApiError contains statusCode, errorCode, errorData", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse("NOT_FOUND", "server missing", 404));
      try {
        await client.get("/servers/bad-id");
      } catch (e) {
        expect(e).toBeInstanceOf(CraftyApiError);
        const err = e as CraftyApiError;
        expect(err.statusCode).toBe(404);
        expect(err.errorCode).toBe("NOT_FOUND");
        expect(err.errorData).toBe("server missing");
      }
    });

    it("throws timeout error when request exceeds timeout", async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => {
              const err = new DOMException("Aborted", "AbortError");
              reject(err);
            }, 10)
          )
      );
      const fastClient = new CraftyClient({
        baseUrl: "https://crafty.test",
        apiToken: "tok",
        allowInsecure: false,
        timeout: 1,
      });
      await expect(fastClient.get("/servers")).rejects.toThrow("timed out");
    });
  });

  // ---- login ----

  describe("login()", () => {
    let client: CraftyClient;

    beforeEach(() => {
      client = new CraftyClient({
        baseUrl: "https://crafty.test",
        apiToken: "",
        allowInsecure: false,
        timeout: 5000,
      });
    });

    it("POSTs to /api/v2/auth/login (not /api/v2/login)", async () => {
      mockFetch.mockResolvedValueOnce(
        okResponse({ token: "jwt-abc", user_id: 1 })
      );
      await client.login("admin", "pass");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://crafty.test/api/v2/auth/login",
        expect.anything()
      );
    });

    it("does NOT send Authorization header", async () => {
      mockFetch.mockResolvedValueOnce(
        okResponse({ token: "jwt-abc", user_id: 1 })
      );
      await client.login("admin", "pass");
      const [, init] = mockFetch.mock.calls[0]!;
      const headers = (init as RequestInit).headers as Record<string, string>;
      expect(headers["Authorization"]).toBeUndefined();
    });

    it("includes totp in body when provided", async () => {
      mockFetch.mockResolvedValueOnce(
        okResponse({ token: "jwt-abc", user_id: 1 })
      );
      await client.login("admin", "pass", "123456");
      const [, init] = mockFetch.mock.calls[0]!;
      const body = JSON.parse((init as RequestInit).body as string) as Record<string, string>;
      expect(body["totp"]).toBe("123456");
    });

    it("returns token and user_id", async () => {
      mockFetch.mockResolvedValueOnce(
        okResponse({ token: "jwt-abc", user_id: 42 })
      );
      const result = await client.login("admin", "pass");
      expect(result.token).toBe("jwt-abc");
      expect(result.user_id).toBe(42);
    });
  });
});
