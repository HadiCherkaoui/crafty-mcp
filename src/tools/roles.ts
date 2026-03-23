import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerRoleTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "role_list",
    "List all roles in Crafty Controller",
    {},
    async () => {
      try {
        const data = await client.get("/roles");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "role_get",
    "Get details for a specific role",
    { role_id: z.string().describe("Role ID") },
    async ({ role_id }) => {
      try {
        const data = await client.get(`/roles/${role_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "role_create",
    "Create a new role in Crafty Controller",
    {
      role_data: z.record(z.string(), z.unknown()).describe("Role configuration data"),
    },
    async ({ role_data }) => {
      try {
        const data = await client.post("/roles", role_data);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "role_update",
    "Update an existing role in Crafty Controller",
    {
      role_id: z.string().describe("Role ID to update"),
      updates: z.record(z.string(), z.unknown()).describe("Role fields to update"),
    },
    async ({ role_id, updates }) => {
      try {
        const data = await client.patch(`/roles/${role_id}`, updates);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "role_delete",
    "Delete a role from Crafty Controller",
    { role_id: z.string().describe("Role ID to delete") },
    async ({ role_id }) => {
      try {
        const data = await client.delete(`/roles/${role_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
