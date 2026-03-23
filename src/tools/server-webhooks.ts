import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerServerWebhookTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "server_list_webhooks",
    "List all webhooks configured for a Minecraft server",
    { server_id: z.string().describe("Server ID or UUID") },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/webhooks`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_webhook",
    "Get details for a specific webhook",
    {
      server_id: z.string().describe("Server ID or UUID"),
      webhook_id: z.string().describe("Webhook ID"),
    },
    async ({ server_id, webhook_id }) => {
      try {
        const data = await client.get(
          `/servers/${server_id}/webhooks/${webhook_id}`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_create_webhook",
    "Create a new webhook for a Minecraft server. Supports Discord and other webhook types. Trigger events: server_start, server_stop, server_backup, player_join, player_leave, etc.",
    {
      server_id: z.string().describe("Server ID or UUID"),
      webhook_type: z.string().describe("Webhook type, e.g. 'Discord'"),
      name: z.string().describe("Webhook name"),
      url: z.string().url().describe("Webhook URL"),
      bot_name: z.string().optional().describe("Bot display name"),
      trigger: z
        .string()
        .describe(
          "Trigger event: server_start, server_stop, server_backup, player_join, player_leave, etc."
        ),
      body: z.string().optional().describe("Custom webhook body template"),
      enabled: z.boolean().default(true).describe("Whether webhook is active"),
    },
    async ({ server_id, ...webhookData }) => {
      try {
        const data = await client.post(
          `/servers/${server_id}/webhooks`,
          webhookData
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_update_webhook",
    "Update an existing webhook for a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      webhook_id: z.string().describe("Webhook ID to update"),
      updates: z.record(z.string(), z.unknown()).describe("Webhook fields to update"),
    },
    async ({ server_id, webhook_id, updates }) => {
      try {
        const data = await client.patch(
          `/servers/${server_id}/webhooks/${webhook_id}`,
          updates
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_delete_webhook",
    "Delete a webhook from a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      webhook_id: z.string().describe("Webhook ID to delete"),
    },
    async ({ server_id, webhook_id }) => {
      try {
        const data = await client.delete(
          `/servers/${server_id}/webhooks/${webhook_id}`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_test_webhook",
    "Send a test message to verify a webhook is working",
    {
      server_id: z.string().describe("Server ID or UUID"),
      webhook_id: z.string().describe("Webhook ID to test"),
    },
    async ({ server_id, webhook_id }) => {
      try {
        const data = await client.post(
          `/servers/${server_id}/webhooks/${webhook_id}/test`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
