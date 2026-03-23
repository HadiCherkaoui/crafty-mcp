import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerServerBackupTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "server_list_backups",
    "List all backups for a Minecraft server with timestamps and sizes",
    { server_id: z.string().describe("Server ID or UUID") },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/backups`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_backup_config",
    "Get backup configuration for a Minecraft server (compression, exclusions, schedule, max backups)",
    { server_id: z.string().describe("Server ID or UUID") },
    async ({ server_id }) => {
      try {
        const data = await client.get(`/servers/${server_id}/backups/config`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_update_backup_config",
    "Update backup configuration for a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      backup_name: z.string().min(3).optional().describe("Backup configuration name"),
      max_backups: z.number().optional().describe("Maximum number of backups to keep"),
      compress: z.boolean().optional().describe("Compress backups"),
      shutdown: z.boolean().optional().describe("Shut down server before backup"),
      before: z.string().optional().describe("Command to run before backup"),
      after: z.string().optional().describe("Command to run after backup"),
      excluded_dirs: z.array(z.string()).optional().describe("Directories to exclude from backup"),
    },
    async ({ server_id, ...updates }) => {
      try {
        const data = await client.patch(`/servers/${server_id}/backups/config`, updates);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_restore_backup",
    "Restore a specific backup for a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      backup_id: z.string().describe("Backup ID"),
      filename: z.string().min(5).describe("Backup filename to restore"),
      in_place: z.boolean().default(true).describe("Restore in place (true) or to a new location"),
    },
    async ({ server_id, backup_id, filename, in_place }) => {
      try {
        const data = await client.post(
          `/servers/${server_id}/backups/backup/${backup_id}/restore`,
          { filename, inPlace: in_place }
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_delete_backup",
    "Delete a specific backup for a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      backup_id: z.string().describe("Backup ID to delete"),
    },
    async ({ server_id, backup_id }) => {
      try {
        const data = await client.delete(
          `/servers/${server_id}/backups/backup/${backup_id}`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
