import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerServerTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "server_list",
    "List all Minecraft servers managed by Crafty Controller with their IDs, names, types, ports, and configurations",
    {},
    async () => {
      try {
        const data = await client.get("/servers");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get",
    "Get full configuration details for a specific Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
    },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_create",
    "Create a new Minecraft server in Crafty Controller. Supports Java (download jar or import), Bedrock, and custom server types.",
    {
      name: z.string().min(2).describe("Server name (min 2 chars, no slashes or hashes)"),
      monitoring_type: z
        .enum(["minecraft_java", "minecraft_bedrock", "none"])
        .describe("Monitoring/server type"),
      create_type: z
        .enum(["minecraft_java", "minecraft_bedrock", "custom"])
        .describe("Server creation type"),
      minecraft_java_create_data: z
        .object({
          create_type: z.enum(["download_jar", "import_server"]),
          download_jar_create_data: z
            .object({
              category: z.string().default("mc_java_servers"),
              type: z
                .string()
                .describe("Server software: paper, vanilla, fabric, forge, etc."),
              version: z.string().describe("Minecraft version, e.g. 1.21"),
              mem_min: z.number().default(1).describe("Min RAM in GB"),
              mem_max: z.number().default(2).describe("Max RAM in GB"),
              server_properties_port: z
                .number()
                .default(25565)
                .describe("Server port (1-65535)"),
              agree_to_eula: z.boolean().default(true),
            })
            .optional(),
        })
        .optional()
        .describe("Required when create_type is minecraft_java"),
      minecraft_bedrock_create_data: z
        .object({
          create_type: z.enum(["download_exe", "import_server"]),
          download_exe_create_data: z
            .object({
              agree_to_eula: z.boolean().default(true),
            })
            .optional(),
        })
        .optional()
        .describe("Required when create_type is minecraft_bedrock"),
    },
    async (args) => {
      try {
        const data = await client.post("/servers", args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_update",
    "Update a Minecraft server's configuration (name, ports, auto-start, crash detection, stop command, etc.)",
    {
      server_id: z.string().describe("Server ID or UUID"),
      updates: z.record(z.unknown()).describe("Configuration fields to update"),
    },
    async ({ server_id, updates }) => {
      try {
        const data = await client.patch(`/servers/${server_id}`, updates);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_delete",
    "Delete a Minecraft server from Crafty Controller",
    {
      server_id: z.string().describe("Server ID or UUID"),
    },
    async ({ server_id }) => {
      try {
        const data = await client.delete(`/servers/${server_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
