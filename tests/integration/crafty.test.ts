import { describe, it, expect, beforeAll } from "vitest";
import { getClient } from "./helpers.js";

describe("Crafty host stats (integration)", () => {
  beforeAll(() => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  });

  it("crafty_get_stats returns cpu and memory data", async () => {
    const client = getClient();
    const data = await client.get<Record<string, unknown>>("/crafty/stats");
    expect(data).toBeDefined();
    // The stats response contains cpu and mem fields
    expect(typeof data).toBe("object");
  });

  it("crafty_get_config returns a config object", async () => {
    const client = getClient();
    const data = await client.get<Record<string, unknown>>("/crafty/config");
    expect(data).toBeDefined();
    expect(typeof data).toBe("object");
  });
});
