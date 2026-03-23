import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerUserTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "user_list",
    "List all Crafty Controller users. Returns user_id, username, enabled, superuser, lang, and creation date.",
    {
      ids_only: z
        .boolean()
        .optional()
        .describe("If true, returns only user IDs for a minimal response"),
    },
    async ({ ids_only }) => {
      try {
        const path = ids_only ? "/users?ids=true" : "/users";
        const data = await client.get(path);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_get",
    "Get details for a specific Crafty Controller user. Use '@me' as user_id to get the currently authenticated user.",
    { user_id: z.string().describe("User ID or '@me' for the current user") },
    async ({ user_id }) => {
      try {
        const data = await client.get(`/users/${user_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_create",
    "Create a new Crafty Controller user account. Requires superuser privileges.",
    {
      username: z.string().describe("Username"),
      password: z.string().describe("Password"),
      email: z.string().email().optional().describe("Email address"),
      lang: z.string().default("en").describe("Language code (e.g. 'en', 'fr', 'de')"),
      superuser: z.boolean().default(false).describe("Grant superuser privileges"),
      theme: z.string().optional().describe("UI theme"),
      manager: z
        .number()
        .optional()
        .describe("Manager user ID (assigns a manager to this user)"),
    },
    async (userData) => {
      try {
        const data = await client.post("/users", userData);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_update",
    "Update a Crafty Controller user account",
    {
      user_id: z.string().describe("User ID or '@me' for the current user"),
      updates: z.record(z.string(), z.unknown()).describe("User fields to update"),
    },
    async ({ user_id, updates }) => {
      try {
        const data = await client.patch(`/users/${user_id}`, updates);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_delete",
    "Permanently delete a Crafty Controller user account. Requires superuser privileges.",
    { user_id: z.string().describe("User ID to delete") },
    async ({ user_id }) => {
      try {
        const data = await client.delete(`/users/${user_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_get_permissions",
    "Get a user's Crafty and per-server permissions",
    { user_id: z.string().describe("User ID or '@me'") },
    async ({ user_id }) => {
      try {
        const data = await client.get(`/users/${user_id}/permissions`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_update_permissions",
    "Update a user's Crafty and per-server permissions",
    {
      user_id: z.string().describe("User ID"),
      permissions: z.record(z.string(), z.unknown()).describe("Permission configuration to update"),
    },
    async ({ user_id, permissions }) => {
      try {
        const data = await client.patch(`/users/${user_id}/permissions`, permissions);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_get_api_keys",
    "List API keys for a Crafty Controller user",
    { user_id: z.string().describe("User ID or '@me'") },
    async ({ user_id }) => {
      try {
        const data = await client.get(`/users/${user_id}/api`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_create_api_key",
    "Generate a new API key for a Crafty Controller user",
    {
      user_id: z.string().describe("User ID or '@me'"),
      name: z.string().optional().describe("Optional name/description for the API key"),
    },
    async ({ user_id, name }) => {
      try {
        const data = await client.post(`/users/${user_id}/api`, name ? { name } : undefined);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "user_delete_api_key",
    "Revoke/delete an API key for a Crafty Controller user",
    {
      user_id: z.string().describe("User ID or '@me'"),
      key_id: z.string().describe("API key ID to revoke"),
    },
    async ({ user_id, key_id }) => {
      try {
        const data = await client.delete(`/users/${user_id}/api/${key_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
