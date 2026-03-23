import { describe, it, expect, beforeAll } from "vitest";
import { getSession, getClient } from "./helpers.js";

describe("Auth / Meta (integration)", () => {
  beforeAll(() => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  });

  it("GET /api/v2 returns API info without authentication", async () => {
    const { url } = getSession();
    const res = await fetch(`${url}/api/v2`);
    expect(res.ok).toBe(true);
    const json = await res.json() as Record<string, unknown>;
    expect(json["status"]).toBe("ok");
  });

  it("CraftyClient.login() authenticates and returns a token", async () => {
    // We already have a token from globalSetup, but verify login works
    const { url } = getSession();
    const credsRaw = (await import("fs")).readFileSync("tests/docker/config/default-creds.txt", "utf-8").trim();
    const passMatch = credsRaw.match(/[Pp]assword[:\s]+(\S+)/);
    if (!passMatch) return; // skip if we can't parse creds format

    const client = new (await import("../../src/client.js")).CraftyClient({
      baseUrl: url,
      apiToken: "",
      allowInsecure: true,
      timeout: 10000,
    });
    const result = await client.login("admin", passMatch[1]!);
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
    expect(typeof result.user_id).toBe("number");
  });

  it("CraftyClient with valid token can call authenticated endpoint", async () => {
    const client = getClient();
    const data = await client.get("/crafty/config");
    expect(data).toBeDefined();
  });
});
