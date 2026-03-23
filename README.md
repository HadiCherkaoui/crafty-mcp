# crafty-mcp

![npm](https://img.shields.io/npm/v/crafty-mcp)

An MCP (Model Context Protocol) server for [Crafty Controller 4](https://craftycontrol.com) — manage your Minecraft servers via AI assistants.

> The first MCP server for Crafty Controller.

## What it does

`crafty-mcp` exposes the full Crafty Controller 4 API V2 as MCP tools, letting AI assistants like Claude manage your Minecraft servers using natural language. Start and stop servers, send console commands, manage players, edit server files, configure backups, set up scheduled tasks, manage webhooks, and administer users — all without leaving your AI chat.

## Quick Start

Add to your MCP client config:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

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

**Claude Code:**

```bash
claude mcp add crafty npx -y crafty-mcp \
  --env CRAFTY_URL=https://localhost:8443 \
  --env CRAFTY_API_TOKEN=your-token \
  --env CRAFTY_ALLOW_INSECURE=true
```

**Cursor** (`.cursor/mcp.json`):

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

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `CRAFTY_URL` | Yes | Crafty Controller base URL (e.g. `https://localhost:8443`) |
| `CRAFTY_API_TOKEN` | No* | Bearer token from Crafty UI |
| `CRAFTY_ALLOW_INSECURE` | No | Set to `true` to allow self-signed certificates (Crafty's default) |
| `CRAFTY_TIMEOUT` | No | Request timeout in milliseconds (default: `30000`) |

> *`CRAFTY_API_TOKEN` is optional if you authenticate dynamically using the `crafty_login` tool, but recommended for most setups.

## Getting your API token

1. Open Crafty Controller in your browser
2. Click your username -> **Profile**
3. Scroll to **API Keys** section
4. Click **Generate Key**
5. Copy the token and use it as `CRAFTY_API_TOKEN`

> A superuser token has full access to all servers and operations.

## Available Tools

### Auth / Meta

| Tool | Description |
|------|-------------|
| `crafty_login` | Login with username/password to get a bearer token |
| `crafty_api_info` | Get API version info and MOTD |
| `crafty_list_schemas` | List available JSON schema names |
| `crafty_get_schema` | Get a specific JSON schema by name |

### Crafty Host (System)

| Tool | Description |
|------|-------------|
| `crafty_get_stats` | Get host CPU, RAM, disk, and boot time |
| `crafty_get_config` | Get Crafty panel configuration |
| `crafty_update_config` | Update Crafty panel configuration |

### Servers — CRUD & Info

| Tool | Description |
|------|-------------|
| `server_list` | List all managed Minecraft servers |
| `server_get` | Get a server's full configuration |
| `server_create` | Create a new Minecraft server (Java, Bedrock, custom) |
| `server_update` | Update server configuration |
| `server_delete` | Permanently delete a server |

### Servers — Runtime & Logs

| Tool | Description |
|------|-------------|
| `server_get_stats` | Get live stats: CPU/RAM, players online, version, world |
| `server_get_logs` | Get server console log lines |
| `server_get_history` | Get historical stats for graphing |

### Servers — Actions

| Tool | Description |
|------|-------------|
| `server_start` | Start a server |
| `server_stop` | Stop a server |
| `server_restart` | Restart a server |
| `server_kill` | Force-kill a server process |
| `server_backup` | Trigger an immediate backup |
| `server_update_executable` | Update the server jar/executable |
| `server_clone` | Clone an existing server |

### Servers — Console

| Tool | Description |
|------|-------------|
| `server_send_command` | Send a command to the server console |

### Servers — Files

| Tool | Description |
|------|-------------|
| `server_list_files` | List files/directories in a server directory |
| `server_get_file` | Read a file's contents |
| `server_update_file` | Write or update a file |
| `server_delete_file` | Delete files or directories |
| `server_create_file` | Create a new file |
| `server_create_directory` | Create a new directory |
| `server_rename_file` | Rename or move a file |
| `server_decompress_file` | Decompress an archive |

### Servers — Backups

| Tool | Description |
|------|-------------|
| `server_list_backups` | List all backups with timestamps and sizes |
| `server_get_backup_config` | Get backup configuration |
| `server_update_backup_config` | Update backup settings |
| `server_restore_backup` | Restore a specific backup |
| `server_delete_backup` | Delete a backup |

### Servers — Scheduled Tasks

| Tool | Description |
|------|-------------|
| `server_list_tasks` | List all scheduled tasks |
| `server_get_task` | Get a task's configuration |
| `server_create_task` | Create a scheduled task (interval or cron) |
| `server_update_task` | Update a scheduled task |
| `server_delete_task` | Delete a scheduled task |
| `server_run_task` | Manually trigger a task |

### Servers — Webhooks

| Tool | Description |
|------|-------------|
| `server_list_webhooks` | List all webhooks |
| `server_get_webhook` | Get a webhook's details |
| `server_create_webhook` | Create a webhook (Discord, etc.) |
| `server_update_webhook` | Update a webhook |
| `server_delete_webhook` | Delete a webhook |
| `server_test_webhook` | Send a test webhook message |

### Users

| Tool | Description |
|------|-------------|
| `user_list` | List all Crafty users |
| `user_get` | Get a user's details (use `@me` for yourself) |
| `user_create` | Create a new user |
| `user_update` | Update a user |
| `user_delete` | Delete a user |
| `user_get_permissions` | Get user permissions |
| `user_update_permissions` | Update user permissions |
| `user_get_api_keys` | List a user's API keys |
| `user_create_api_key` | Generate a new API key |
| `user_delete_api_key` | Revoke an API key |

### Roles

| Tool | Description |
|------|-------------|
| `role_list` | List all roles |
| `role_get` | Get a role's details |
| `role_create` | Create a new role |
| `role_update` | Update a role |
| `role_delete` | Delete a role |

## Examples

```
"What servers are running?" -> server_list + server_get_stats
"Start my SMP server" -> server_start
"How many players are online on survival?" -> server_get_stats
"Send 'say Server restarting in 5 minutes' to all servers" -> server_list + server_send_command
"Back up all servers" -> server_list + server_backup (for each)
"Show me the server.properties for my SMP server" -> server_get_file
"Create a Paper 1.21.4 server on port 25566" -> server_create
"Set up a daily backup at 3 AM" -> server_create_task (cron: "0 3 * * *")
"Add a Discord webhook that fires when the server starts" -> server_create_webhook
"Op PlayerName on the survival server" -> server_send_command
```

## Development

```bash
git clone https://github.com/HadiCherkaoui/crafty-mcp.git
cd crafty-mcp
npm install
npm run build

# Test locally
CRAFTY_URL=https://localhost:8443 \
CRAFTY_API_TOKEN=your-token \
CRAFTY_ALLOW_INSECURE=true \
node dist/index.js

# Inspect with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT — [Hadi Cherkaoui](https://github.com/HadiCherkaoui)
