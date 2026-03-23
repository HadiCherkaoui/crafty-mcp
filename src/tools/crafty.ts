import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerCraftyTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "crafty_get_stats",
    "Get Crafty Controller host system stats: CPU usage/count/frequency, RAM usage/total/percent, disk data (device, total, used, free, percent, filesystem, mount), and boot time",
    {},
    async () => {
      try {
        const data = await client.get("/crafty/stats");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "crafty_get_config",
    "Get Crafty Controller panel configuration settings",
    {},
    async () => {
      try {
        const data = await client.get("/crafty/config");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "crafty_update_config",
    "Update Crafty Controller panel configuration settings",
    {
      config: z.record(z.string(), z.unknown()).describe("Configuration key-value pairs to update"),
    },
    async ({ config }) => {
      try {
        const data = await client.patch("/crafty/config", config);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
