import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CraftyClient } from "../../../src/client.js";
import { registerAuthTools } from "../../../src/tools/auth.js";
import { registerCraftyTools } from "../../../src/tools/crafty.js";
import { registerServerTools } from "../../../src/tools/servers.js";
import { registerServerActionTools } from "../../../src/tools/server-actions.js";
import { registerServerConsoleTools } from "../../../src/tools/server-console.js";
import { registerServerFileTools } from "../../../src/tools/server-files.js";
import { registerServerBackupTools } from "../../../src/tools/server-backups.js";
import { registerServerTaskTools } from "../../../src/tools/server-tasks.js";
import { registerServerWebhookTools } from "../../../src/tools/server-webhooks.js";
import { registerUserTools } from "../../../src/tools/users.js";
import { registerRoleTools } from "../../../src/tools/roles.js";

function makeClient() {
  return new CraftyClient({
    baseUrl: "https://crafty.test",
    apiToken: "test",
    allowInsecure: false,
    timeout: 5000,
  });
}

describe("Tool registration", () => {
  let server: McpServer;
  let client: CraftyClient;
  const registeredTools: string[] = [];

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    server = new McpServer({ name: "crafty-mcp", version: "0.0.0" });
    client = makeClient();
    registeredTools.length = 0;

    // Spy on server.tool to capture registered tool names
    const original = server.tool.bind(server);
    vi.spyOn(server, "tool").mockImplementation((...args: Parameters<typeof server.tool>) => {
      registeredTools.push(args[0] as string);
      return original(...args);
    });
  });

  it("auth.ts registers exactly 4 tools", () => {
    registerAuthTools(server, client);
    expect(registeredTools).toHaveLength(4);
    expect(registeredTools).toContain("crafty_login");
    expect(registeredTools).toContain("crafty_api_info");
    expect(registeredTools).toContain("crafty_list_schemas");
    expect(registeredTools).toContain("crafty_get_schema");
  });

  it("crafty.ts registers exactly 3 tools", () => {
    registerCraftyTools(server, client);
    expect(registeredTools).toHaveLength(3);
    expect(registeredTools).toContain("crafty_get_stats");
    expect(registeredTools).toContain("crafty_get_config");
    expect(registeredTools).toContain("crafty_update_config");
  });

  it("servers.ts registers exactly 5 tools", () => {
    registerServerTools(server, client);
    expect(registeredTools).toHaveLength(5);
    expect(registeredTools).toContain("server_list");
    expect(registeredTools).toContain("server_get");
    expect(registeredTools).toContain("server_create");
    expect(registeredTools).toContain("server_update");
    expect(registeredTools).toContain("server_delete");
  });

  it("server-actions.ts registers exactly 7 tools", () => {
    registerServerActionTools(server, client);
    expect(registeredTools).toHaveLength(7);
    expect(registeredTools).toContain("server_start");
    expect(registeredTools).toContain("server_stop");
    expect(registeredTools).toContain("server_restart");
    expect(registeredTools).toContain("server_kill");
    expect(registeredTools).toContain("server_backup");
    expect(registeredTools).toContain("server_update_executable");
    expect(registeredTools).toContain("server_clone");
  });

  it("server-console.ts registers exactly 4 tools", () => {
    registerServerConsoleTools(server, client);
    expect(registeredTools).toHaveLength(4);
    expect(registeredTools).toContain("server_send_command");
    expect(registeredTools).toContain("server_get_logs");
    expect(registeredTools).toContain("server_get_stats");
    expect(registeredTools).toContain("server_get_history");
  });

  it("server-files.ts registers exactly 8 tools", () => {
    registerServerFileTools(server, client);
    expect(registeredTools).toHaveLength(8);
    expect(registeredTools).toContain("server_list_files");
    expect(registeredTools).toContain("server_get_file");
    expect(registeredTools).toContain("server_update_file");
    expect(registeredTools).toContain("server_delete_file");
    expect(registeredTools).toContain("server_create_file");
    expect(registeredTools).toContain("server_create_directory");
    expect(registeredTools).toContain("server_rename_file");
    expect(registeredTools).toContain("server_decompress_file");
  });

  it("server-backups.ts registers exactly 5 tools", () => {
    registerServerBackupTools(server, client);
    expect(registeredTools).toHaveLength(5);
  });

  it("server-tasks.ts registers exactly 6 tools", () => {
    registerServerTaskTools(server, client);
    expect(registeredTools).toHaveLength(6);
  });

  it("server-webhooks.ts registers exactly 6 tools", () => {
    registerServerWebhookTools(server, client);
    expect(registeredTools).toHaveLength(6);
  });

  it("users.ts registers exactly 10 tools", () => {
    registerUserTools(server, client);
    expect(registeredTools).toHaveLength(10);
  });

  it("roles.ts registers exactly 5 tools", () => {
    registerRoleTools(server, client);
    expect(registeredTools).toHaveLength(5);
  });

  it("all 11 modules together register exactly 63 tools", () => {
    registerAuthTools(server, client);
    registerCraftyTools(server, client);
    registerServerTools(server, client);
    registerServerActionTools(server, client);
    registerServerConsoleTools(server, client);
    registerServerFileTools(server, client);
    registerServerBackupTools(server, client);
    registerServerTaskTools(server, client);
    registerServerWebhookTools(server, client);
    registerUserTools(server, client);
    registerRoleTools(server, client);
    expect(registeredTools).toHaveLength(63);
  });
});
