import { describe, it, expect, beforeAll } from "vitest";
import { getClient } from "./helpers.js";

describe("Server list (integration)", () => {
  beforeAll(() => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  });

  it("server_list returns an array", async () => {
    const client = getClient();
    const data = await client.get<unknown[]>("/servers");
    expect(Array.isArray(data)).toBe(true);
  });
});
