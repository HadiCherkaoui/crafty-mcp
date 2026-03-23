#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CraftyClient } from "./client.js";
import { CraftyConfig } from "./types.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerCraftyTools } from "./tools/crafty.js";
import { registerServerTools } from "./tools/servers.js";
import { registerServerActionTools } from "./tools/server-actions.js";
import { registerServerConsoleTools } from "./tools/server-console.js";
import { registerServerFileTools } from "./tools/server-files.js";
import { registerServerBackupTools } from "./tools/server-backups.js";
import { registerServerTaskTools } from "./tools/server-tasks.js";
import { registerServerWebhookTools } from "./tools/server-webhooks.js";
import { registerUserTools } from "./tools/users.js";
import { registerRoleTools } from "./tools/roles.js";

function getConfig(): CraftyConfig {
  const baseUrl = process.env["CRAFTY_URL"];
  const apiToken = process.env["CRAFTY_API_TOKEN"] ?? "";

  if (!baseUrl) {
    console.error("Error: CRAFTY_URL environment variable is required");
    process.exit(1);
  }

  return {
    baseUrl,
    apiToken,
    allowInsecure: process.env["CRAFTY_ALLOW_INSECURE"] === "true",
    timeout: parseInt(process.env["CRAFTY_TIMEOUT"] ?? "30000", 10),
  };
}

async function main(): Promise<void> {
  const config = getConfig();
  const client = new CraftyClient(config);

  const server = new McpServer({
    name: "crafty-mcp",
    version: "0.1.0",
  });

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

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
