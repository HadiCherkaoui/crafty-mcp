# crafty-mcp — MCP Server for Crafty Controller 4

## Project Overview

Build and publish an MCP (Model Context Protocol) server that wraps the **Crafty Controller 4 API V2** (`/api/v2/*`), enabling AI assistants (Claude Code, Claude Desktop, Cursor, etc.) to manage Minecraft servers via natural language.

**This is the first MCP server for Crafty Controller — none exist yet.**

### Distribution

- **Language:** TypeScript
- **Runtime:** Node.js (>=18)
- **Package name:** `crafty-mcp` (check npm availability, fallback: `@hadicherkaoui/crafty-mcp`)
- **Install method:** `npx crafty-mcp` — zero-install for end users
- **Publish to:** npm
- **License:** MIT

### User configuration

```json
{
  "mcpServers": {
    "crafty": {
      "command": "npx",
      "args": ["-y", "crafty-mcp"],
      "env": {
        "CRAFTY_URL": "https://localhost:8443",
        "CRAFTY_API_TOKEN": "your-bearer-token",
        "CRAFTY_ALLOW_INSECURE": "true"
      }
    }
  }
}
```

`CRAFTY_ALLOW_INSECURE` is needed because Crafty defaults to a self-signed HTTPS cert on port 8443.

---

## API Reference

**Full Crafty Controller 4 API V2 docs:** https://wiki.craftycontrol.com/en/4/docs/API%20V2
**OpenAPI spec (if the interactive docs don't render):** https://docs.craftycontrol.com/pages/developer-guide/api-reference/v2/ → links to `openapi-spec.yml`

### Authentication

Every endpoint except `POST /api/v2/login`, `GET /api/v2`, and `GET /api/v2/jsonschema/*` requires a bearer token:

```
Authorization: Bearer <token>
```

Users generate API tokens from the Crafty web UI under their profile settings. A superuser token has access to all servers and all permissions.

### Response format

All responses follow this structure:

```json
{
  "status": "ok",
  "data": { ... }
}
```

Error responses:

```json
{
  "status": "error",
  "error": "ERROR_CODE",
  "data": { ... }
}
```

---

## Complete Endpoint Coverage → MCP Tools

Implement ALL of the following. Group them logically in the tool names.

### 1. Auth / Meta

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `crafty_login` | POST | `/api/v2/login` | Login with username/password, returns bearer token. Useful if user prefers user/pass over pre-generated token. |
| `crafty_api_info` | GET | `/api/v2` | Get API version info and MOTD |
| `crafty_get_schema` | GET | `/api/v2/jsonschema/{schema_name}` | Get a specific JSON schema by name |
| `crafty_list_schemas` | GET | `/api/v2/jsonschema` | List all available JSON schema names |

### 2. Crafty Host (System-Level)

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `crafty_get_stats` | GET | `/api/v2/crafty/stats` | Get host system stats: CPU usage, CPU count, CPU freq, RAM usage/total/percent, disk data (device, total, used, free, percent, fs, mount), boot time |
| `crafty_get_config` | GET | `/api/v2/crafty/config` | Get Crafty panel configuration |
| `crafty_update_config` | PATCH | `/api/v2/crafty/config` | Update Crafty panel configuration |

### 3. Servers — CRUD & Info

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_list` | GET | `/api/v2/servers` | List all servers. Returns array of server objects with: server_id, server_uuid, server_name, path, backup_path, executable, log_path, execution_command, auto_start, auto_start_delay, crash_detection, stop_command, executable_update_url, server_ip, server_port, logs_delete_after, type (minecraft-java/minecraft-bedrock) |
| `server_get` | GET | `/api/v2/servers/{id}` | Get a specific server's full configuration |
| `server_create` | POST | `/api/v2/servers` | Create a new Minecraft server. Body includes: name, port, min_mem, max_mem, server_type, etc. Returns new_server_id and new_server_uuid |
| `server_update` | PATCH | `/api/v2/servers/{id}` | Update server configuration. Supports fields like: server_name, executable, execution_command, auto_start, auto_start_delay, crash_detection, stop_command, server_ip, server_port, logs_delete_after, executable_update_url |
| `server_delete` | DELETE | `/api/v2/servers/{id}` | Delete a server from Crafty |

### 4. Servers — Statistics & Logs

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_get_stats` | GET | `/api/v2/servers/{id}/stats` | Get server runtime stats: started time, running (bool), cpu, mem, mem_percent, world_name, world_size, server_port, online (player count), max (max players), players (list), motd, version, desc |
| `server_get_logs` | GET | `/api/v2/servers/{id}/logs` | Get server console logs as array of strings |
| `server_get_history` | GET | `/api/v2/servers/{id}/history` | Get server stats history (for metrics/graphing) |

### 5. Servers — Actions

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_start` | POST | `/api/v2/servers/{id}/action/start_server` | Start the Minecraft server |
| `server_stop` | POST | `/api/v2/servers/{id}/action/stop_server` | Stop the Minecraft server (sends stop command) |
| `server_restart` | POST | `/api/v2/servers/{id}/action/restart_server` | Restart the Minecraft server |
| `server_kill` | POST | `/api/v2/servers/{id}/action/kill_server` | Force-kill the server process |
| `server_backup` | POST | `/api/v2/servers/{id}/action/backup_server` | Trigger a server backup |
| `server_update_executable` | POST | `/api/v2/servers/{id}/action/update_executable` | Update the server jar/executable from the configured URL |
| `server_clone` | POST | `/api/v2/servers/{id}/action/clone_server` | Clone an existing server |

### 6. Servers — Console / stdin

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_send_command` | POST | `/api/v2/servers/{id}/stdin` | Send a command to the server console. Body: raw command string. Examples: `say Hello everyone!`, `op PlayerName`, `whitelist add Player`, `gamemode creative Player`, `time set day`, `weather clear` |

### 7. Servers — Files

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_list_files` | GET | `/api/v2/servers/{id}/files` | List files/directories in the server's root |
| `server_get_file` | GET | `/api/v2/servers/{id}/files/{path}` | Get contents of a specific file (e.g., server.properties, ops.json, whitelist.json) |
| `server_update_file` | PUT | `/api/v2/servers/{id}/files/{path}` | Update/write a file on the server |
| `server_delete_file` | DELETE | `/api/v2/servers/{id}/files/{path}` | Delete a file from the server |
| `server_create_directory` | POST | `/api/v2/servers/{id}/files/mkdir/{path}` | Create a new directory |
| `server_rename_file` | PUT | `/api/v2/servers/{id}/files/rename/{path}` | Rename/move a file or directory |
| `server_compress_files` | POST | `/api/v2/servers/{id}/files/compress/{path}` | Compress files into an archive |
| `server_decompress_file` | POST | `/api/v2/servers/{id}/files/decompress/{path}` | Decompress an archive |

### 8. Servers — Backups

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_list_backups` | GET | `/api/v2/servers/{id}/backups` | List all backups for a server (with timestamps, sizes) |
| `server_get_backup_config` | GET | `/api/v2/servers/{id}/backups/config` | Get backup configuration (compression, exclusions, schedule) |
| `server_update_backup_config` | PATCH | `/api/v2/servers/{id}/backups/config` | Update backup configuration |
| `server_restore_backup` | POST | `/api/v2/servers/{id}/backups/{backup_id}/restore` | Restore a specific backup |
| `server_delete_backup` | DELETE | `/api/v2/servers/{id}/backups/{backup_id}` | Delete a specific backup |

### 9. Servers — Schedules / Tasks

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_list_tasks` | GET | `/api/v2/servers/{id}/tasks` | List all scheduled tasks for a server |
| `server_get_task` | GET | `/api/v2/servers/{id}/tasks/{task_id}` | Get a specific task's config |
| `server_create_task` | POST | `/api/v2/servers/{id}/tasks` | Create a new scheduled task (command, backup, restart — with cron or interval trigger) |
| `server_update_task` | PATCH | `/api/v2/servers/{id}/tasks/{task_id}` | Update a scheduled task |
| `server_delete_task` | DELETE | `/api/v2/servers/{id}/tasks/{task_id}` | Delete a scheduled task |
| `server_run_task` | POST | `/api/v2/servers/{id}/tasks/{task_id}/run` | Manually trigger a scheduled task |

### 10. Servers — Webhooks

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `server_list_webhooks` | GET | `/api/v2/servers/{id}/webhooks` | List all webhooks for a server. Returns webhook_type (Discord, etc.), name, url, bot_name, trigger (server_start, server_stop, server_backup, etc.), body, enabled |
| `server_get_webhook` | GET | `/api/v2/servers/{id}/webhooks/{webhook_id}` | Get a specific webhook |
| `server_create_webhook` | POST | `/api/v2/servers/{id}/webhooks` | Create a new webhook |
| `server_update_webhook` | PATCH | `/api/v2/servers/{id}/webhooks/{webhook_id}` | Update a webhook |
| `server_delete_webhook` | DELETE | `/api/v2/servers/{id}/webhooks/{webhook_id}` | Delete a webhook |
| `server_test_webhook` | POST | `/api/v2/servers/{id}/webhooks/{webhook_id}/test` | Send a test webhook |

### 11. Users

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `user_list` | GET | `/api/v2/users` | List all Crafty users. Add `?ids=true` for minimal response (IDs only). Returns: user_id, created, username, enabled, superuser, lang |
| `user_get` | GET | `/api/v2/users/{id}` | Get a specific user's details |
| `user_create` | POST | `/api/v2/users` | Create a new Crafty user. Body: username, password, email, lang, superuser, theme, manager (manager user ID) |
| `user_update` | PATCH | `/api/v2/users/{id}` | Update a user |
| `user_delete` | DELETE | `/api/v2/users/{id}` | Delete a user |
| `user_get_permissions` | GET | `/api/v2/users/{id}/permissions` | Get user's Crafty and server permissions |
| `user_update_permissions` | PATCH | `/api/v2/users/{id}/permissions` | Update user's permissions |
| `user_get_api_keys` | GET | `/api/v2/users/{id}/api` | List user's API keys |
| `user_create_api_key` | POST | `/api/v2/users/{id}/api` | Generate a new API key for a user |
| `user_delete_api_key` | DELETE | `/api/v2/users/{id}/api/{key_id}` | Revoke an API key |

### 12. Roles

| MCP Tool | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `role_list` | GET | `/api/v2/roles` | List all roles |
| `role_get` | GET | `/api/v2/roles/{id}` | Get a specific role |
| `role_create` | POST | `/api/v2/roles` | Create a new role |
| `role_update` | PATCH | `/api/v2/roles/{id}` | Update a role |
| `role_delete` | DELETE | `/api/v2/roles/{id}` | Delete a role |

---

## Project Structure

```
crafty-mcp/
├── src/
│   ├── index.ts              # Entry point — MCP server setup, stdio transport
│   ├── client.ts             # CraftyClient class — typed HTTP client wrapping all API calls
│   ├── types.ts              # TypeScript interfaces for all API request/response shapes
│   └── tools/
│       ├── auth.ts           # crafty_login, crafty_api_info, crafty_get_schema, crafty_list_schemas
│       ├── crafty.ts         # crafty_get_stats, crafty_get_config, crafty_update_config
│       ├── servers.ts        # server_list, server_get, server_create, server_update, server_delete
│       ├── server-actions.ts # server_start, server_stop, server_restart, server_kill, server_backup, server_update_executable, server_clone
│       ├── server-console.ts # server_send_command, server_get_logs
│       ├── server-files.ts   # All file operations
│       ├── server-backups.ts # All backup operations
│       ├── server-tasks.ts   # All schedule/task operations
│       ├── server-webhooks.ts# All webhook operations
│       ├── users.ts          # All user operations
│       └── roles.ts          # All role operations
├── package.json
├── tsconfig.json
├── README.md                 # Full docs with setup, config examples, tool reference
├── LICENSE                   # MIT
└── .github/
    └── workflows/
        └── publish.yml       # Auto-publish to npm on tag
```

## Technical Requirements

### MCP SDK

Use `@modelcontextprotocol/sdk` (official TypeScript SDK). Server runs on **stdio transport**.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### HTTP Client

Use native `fetch` (Node 18+). Handle:

- **Self-signed certs:** When `CRAFTY_ALLOW_INSECURE=true`, set `NODE_TLS_REJECT_UNAUTHORIZED=0` at startup
- **Base URL normalization:** Strip trailing slashes, ensure `/api/v2` prefix
- **Bearer token:** Inject `Authorization: Bearer ${token}` header on every request
- **Error handling:** Parse Crafty's `{ status: "error", error: "CODE" }` responses into meaningful MCP error messages
- **Timeouts:** 30s default, configurable via `CRAFTY_TIMEOUT`

### Tool Registration Pattern

Each tool file exports a function that registers tools on the MCP server:

```typescript
// Example: tools/servers.ts
export function registerServerTools(server: McpServer, client: CraftyClient) {
  server.tool(
    "server_list",
    "List all Minecraft servers managed by Crafty Controller",
    {},
    async () => {
      const result = await client.get("/servers");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "server_get_stats",
    "Get runtime statistics for a Minecraft server (CPU, RAM, players, version, world info)",
    { server_id: { type: "string", description: "Server ID or UUID" } },
    async ({ server_id }) => {
      const result = await client.get(`/servers/${server_id}/stats`);
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
  // ... more tools
}
```

### Tool Descriptions

Write descriptions that help the LLM pick the right tool. Examples:

- `server_list`: "List all Minecraft servers managed by Crafty Controller with their IDs, names, types, ports, and configurations"
- `server_send_command`: "Send a command to a running Minecraft server's console. Examples: 'say Hello!', 'op PlayerName', 'whitelist add Player', 'gamemode creative Player', 'time set day'"
- `server_get_stats`: "Get live runtime statistics for a Minecraft server including CPU/RAM usage, online players, world name/size, MOTD, and version"
- `server_backup`: "Trigger an immediate backup of a Minecraft server's files"

### Input Validation

Use Zod schemas (comes with MCP SDK) for all tool inputs. Mark server_id as required where needed, validate enum values for actions, etc.

---

## README Structure

1. **What it does** — one paragraph
2. **Quick Start** — npx config snippet for Claude Desktop, Claude Code, and Cursor
3. **Configuration** — env vars table (CRAFTY_URL, CRAFTY_API_TOKEN, CRAFTY_ALLOW_INSECURE, CRAFTY_TIMEOUT)
4. **Getting your API token** — step-by-step from Crafty UI (Profile → API Keys)
5. **Available Tools** — grouped table of all tools with one-line descriptions
6. **Examples** — natural language prompts that trigger tools:
   - "What servers are running?" → server_list + server_get_stats
   - "Start my SMP server" → server_start
   - "Back up all servers" → server_list + server_backup (loop)
   - "How many players are online?" → server_get_stats
   - "Send 'say Server restarting in 5 minutes' to the survival server" → server_send_command
   - "Create a new Paper 1.21 server on port 25566" → server_create
   - "Show me the server.properties file" → server_get_file
   - "Set up a daily backup at 3 AM" → server_create_task
7. **Development** — clone, install, build, test locally
8. **License** — MIT

---

## Implementation Order

1. **Phase 1 (MVP — ship this):** client.ts, types.ts, index.ts, crafty.ts, servers.ts, server-actions.ts, server-console.ts → covers 80% of use cases
2. **Phase 2:** server-files.ts, server-backups.ts → file management and backups
3. **Phase 3:** server-tasks.ts, server-webhooks.ts → automation
4. **Phase 4:** users.ts, roles.ts, auth.ts → admin operations
5. **Phase 5:** README polish, publish to npm, submit to awesome-mcp-servers list, submit to PulseMCP, mcp.so, mcpservers.org

---

## Publishing Checklist

- [ ] `npm init` with proper package.json (name, description, keywords, bin, repository, license)
- [ ] `"bin": { "crafty-mcp": "./dist/index.js" }` — makes it work with npx
- [ ] Add `#!/usr/bin/env node` shebang to index.ts output
- [ ] `"keywords": ["mcp", "crafty", "minecraft", "server-management", "crafty-controller", "model-context-protocol"]`
- [ ] Build step: `tsc` → dist/
- [ ] `"files": ["dist"]` in package.json to keep package small
- [ ] Test with `npx .` locally before publishing
- [ ] `npm publish` (or `npm publish --access public` if scoped)
- [ ] Create GitHub repo with proper description and topics
- [ ] Submit PR to https://github.com/punkpeye/awesome-mcp-servers
- [ ] Submit to https://www.pulsemcp.com/servers (submit button)
- [ ] Submit to https://mcp.so (GitHub issue)
- [ ] Submit to https://github.com/modelcontextprotocol/servers (if it meets their bar)

---

## Notes

- Crafty uses HTTPS by default on port 8443 with a self-signed cert — handle this gracefully
- Server IDs can be integer IDs or UUIDs — accept both as string input
- The API wiki docs use `xh` HTTP client examples — these map 1:1 to fetch calls
- Crafty permissions model: superuser has all access; regular users need per-server permissions
- Some endpoints require specific Crafty permissions (e.g., creating servers requires the "create server" Crafty permission) — document which tools need what in tool descriptions
