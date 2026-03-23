import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CraftyClient } from "../client.js";

export function registerServerFileTools(server: McpServer, client: CraftyClient): void {
  server.tool(
    "server_list_files",
    "List files and directories in a Minecraft server's directory",
    {
      server_id: z.string().describe("Server ID or UUID"),
      path: z.string().default("").describe("Relative path to list (empty string for root)"),
    },
    async ({ server_id, path }) => {
      try {
        const data = await client.post(`/servers/${server_id}/files`, { path });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_get_file",
    "Read the contents of a file on a Minecraft server (e.g., server.properties, ops.json, whitelist.json)",
    {
      server_id: z.string().describe("Server ID or UUID"),
      path: z.string().describe("Relative file path to read"),
    },
    async ({ server_id, path }) => {
      try {
        const data = await client.post(`/servers/${server_id}/files`, { path });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_update_file",
    "Write or update a file on the Minecraft server (e.g., server.properties, ops.json, whitelist.json)",
    {
      server_id: z.string().describe("Server ID or UUID"),
      path: z.string().describe("Relative file path"),
      contents: z.string().describe("New file contents"),
      overwrite: z
        .boolean()
        .default(false)
        .describe("Overwrite even if file was modified externally"),
    },
    async ({ server_id, path, contents, overwrite }) => {
      try {
        const data = await client.patch(`/servers/${server_id}/files`, {
          path,
          contents,
          overwrite,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_delete_file",
    "Delete one or more files or directories from a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      paths: z.array(z.string()).describe("Array of relative file paths to delete"),
    },
    async ({ server_id, paths }) => {
      try {
        const file_system_objects = paths.map((filename) => ({ filename }));
        const data = await client.delete(`/servers/${server_id}/files`, {
          file_system_objects,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_create_file",
    "Create a new file on a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      parent: z.string().describe("Parent directory path"),
      name: z.string().describe("New file name"),
    },
    async ({ server_id, parent, name }) => {
      try {
        const data = await client.put(`/servers/${server_id}/files/create`, {
          parent,
          name,
          directory: false,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_create_directory",
    "Create a new directory on a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      parent: z.string().describe("Parent directory path"),
      name: z.string().describe("New directory name"),
    },
    async ({ server_id, parent, name }) => {
      try {
        const data = await client.put(`/servers/${server_id}/files/create`, {
          parent,
          name,
          directory: true,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_rename_file",
    "Rename or move a file or directory on a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      path: z.string().describe("Current relative file path"),
      new_name: z.string().describe("New file/directory name"),
    },
    async ({ server_id, path, new_name }) => {
      try {
        const data = await client.patch(`/servers/${server_id}/files/create`, {
          path,
          new_name,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  server.tool(
    "server_decompress_file",
    "Decompress/unzip an archive file on a Minecraft server",
    {
      server_id: z.string().describe("Server ID or UUID"),
      folder: z.string().describe("Relative path to the archive file to decompress"),
    },
    async ({ server_id, folder }) => {
      try {
        const data = await client.post(`/servers/${server_id}/files/zip`, { folder });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
