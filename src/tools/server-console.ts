import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerServerConsoleTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "server_send_command",
    "Send a command to a running Minecraft server's console. Examples: 'say Hello everyone!', 'op PlayerName', 'whitelist add Player', 'gamemode creative Player', 'time set day', 'weather clear'",
    {
      server_id: z.string().describe("Server ID or UUID"),
      command: z.string().describe("Command to send to the server console (without leading slash)"),
    },
    async ({ server_id, command }) => {
      try {
        const data = await client.post(`/servers/${server_id}/stdin`, command);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_logs",
    "Get a Minecraft server's console logs as an array of log lines",
    {
      server_id: z.string().describe("Server ID or UUID"),
    },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/logs`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_stats",
    "Get live runtime statistics for a Minecraft server including CPU/RAM usage, online player count and list, world name/size, MOTD, version, and whether it is running",
    {
      server_id: z.string().describe("Server ID or UUID"),
    },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/stats`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_history",
    "Get historical runtime statistics for a Minecraft server (CPU, RAM over time, useful for graphing trends)",
    {
      server_id: z.string().describe("Server ID or UUID"),
    },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/history`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
