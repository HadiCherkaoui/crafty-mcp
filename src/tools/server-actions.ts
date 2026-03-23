import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

const serverIdSchema = { server_id: z.string().describe("Server ID or UUID") };

export function registerServerActionTools(server: McpServer, client: CraftyClient): void {
  const actions: Array<{ name: string; action: string; description: string }> = [
    { name: "server_start", action: "start_server", description: "Start a Minecraft server" },
    { name: "server_stop", action: "stop_server", description: "Stop a Minecraft server (sends configured stop command)" },
    { name: "server_restart", action: "restart_server", description: "Restart a Minecraft server" },
    { name: "server_kill", action: "kill_server", description: "Force-kill a Minecraft server process immediately" },
    { name: "server_backup", action: "backup_server", description: "Trigger an immediate backup of a Minecraft server's files" },
    { name: "server_update_executable", action: "update_executable", description: "Update the server jar/executable from the configured download URL" },
    { name: "server_clone", action: "clone_server", description: "Clone an existing Minecraft server (server must not be running)" },
  ];

  for (const { name, action, description } of actions) {
    server.tool(
      name,
      description,
      serverIdSchema,
      async ({ server_id }) => {
        try {
          const data = await client.post(`/servers/${server_id}/action/${action}`);
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
        }
      }
    );
  }
}
