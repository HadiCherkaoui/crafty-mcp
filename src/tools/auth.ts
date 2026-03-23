import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerAuthTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "crafty_login",
    "Login with username and password to get a bearer token. Use this if you prefer username/password authentication over a pre-generated API token.",
    {
      username: z.string().describe("Crafty Controller username"),
      password: z.string().describe("Crafty Controller password"),
      totp: z
        .string()
        .optional()
        .describe("TOTP/2FA code (required if MFA is enabled on the account)"),
    },
    async ({ username, password, totp }) => {
      try {
        const data = await client.login(username, password, totp);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "crafty_api_info",
    "Get Crafty Controller API version information and message of the day (MOTD). Does not require authentication.",
    {},
    async () => {
      try {
        const data = await client.get("/");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "crafty_list_schemas",
    "List all available JSON schema names in Crafty Controller. Does not require authentication.",
    {},
    async () => {
      try {
        const data = await client.get("/jsonschema");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "crafty_get_schema",
    "Get a specific JSON schema by name from Crafty Controller. Use crafty_list_schemas to discover available schema names.",
    {
      schema_name: z
        .string()
        .describe("Schema name (use crafty_list_schemas to see available names)"),
    },
    async ({ schema_name }) => {
      try {
        const data = await client.get(`/jsonschema/${schema_name}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
