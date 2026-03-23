import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerServerTaskTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "server_list_tasks",
    "List all scheduled tasks for a Minecraft server",
    { server_id: z.string().describe("Server ID or UUID") },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/tasks`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_task",
    "Get configuration for a specific scheduled task",
    {
      server_id: z.string().describe("Server ID or UUID"),
      task_id: z.string().describe("Task ID"),
    },
    async ({ server_id, task_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/tasks/${task_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_create_task",
    "Create a scheduled task for a Minecraft server. Use interval_type with interval for simple schedules (e.g., every 6 hours), or set cron_string with empty interval_type for cron-based schedules (e.g., '0 3 * * *' for 3 AM daily).",
    {
      server_id: z.string().describe("Server ID or UUID"),
      name: z.string().describe("Task name"),
      enabled: z.boolean().default(true).describe("Whether the task is active"),
      action: z
        .string()
        .describe("Action type: command, backup, restart, start, stop"),
      action_id: z.string().optional().describe("ID of the action target, if applicable"),
      interval: z.number().default(1).describe("Interval number (used with interval_type)"),
      interval_type: z
        .enum(["hours", "minutes", "days", "reaction", ""])
        .default("hours")
        .describe("Interval unit. Use empty string with cron_string for cron schedules."),
      start_time: z.string().optional().describe("Start time in HH:MM format"),
      command: z
        .string()
        .optional()
        .describe("Command to run (for command action type)"),
      one_time: z.boolean().default(false).describe("Run once then delete"),
      cron_string: z
        .string()
        .optional()
        .describe("Cron expression (e.g. '0 3 * * *'). Use with interval_type=''."),
      delay: z.number().default(0).describe("Delay in seconds before running"),
    },
    async ({ server_id, ...taskData }) => {
      try {
        const data = await client.post(`/servers/${server_id}/tasks`, taskData);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_update_task",
    "Update an existing scheduled task for a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      task_id: z.string().describe("Task ID to update"),
      updates: z.record(z.string(), z.unknown()).describe("Task fields to update"),
    },
    async ({ server_id, task_id, updates }) => {
      try {
        const data = await client.patch(
          `/servers/${server_id}/tasks/${task_id}`,
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
    "server_delete_task",
    "Delete a scheduled task from a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      task_id: z.string().describe("Task ID to delete"),
    },
    async ({ server_id, task_id }) => {
      try {
        const data = await client.delete(`/servers/${server_id}/tasks/${task_id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_run_task",
    "Manually trigger a scheduled task immediately",
    {
      server_id: z.string().describe("Server ID or UUID"),
      task_id: z.string().describe("Task ID to run"),
    },
    async ({ server_id, task_id }) => {
      try {
        const data = await client.post(
          `/servers/${server_id}/tasks/${task_id}/run`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
