import { execSync } from "child_process";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const CRAFTY_URL = process.env["CRAFTY_TEST_URL"] ?? "https://localhost:8444";
const CONFIG_DIR = join("tests", "docker", "config");
const CREDS_FILE = join(CONFIG_DIR, "default-creds.txt");
const SESSION_FILE = ".test-session.json";
const COMPOSE_FILE = "tests/docker-compose.test.yml";
const MAX_WAIT_MS = 120_000;
const POLL_INTERVAL_MS = 2_000;

async function waitForCrafty(): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(`${CRAFTY_URL}/api/v2`, {
        signal: AbortSignal.timeout(3000),
      } as RequestInit & { signal: AbortSignal });
      if (res.ok || res.status === 200) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`Crafty did not become ready within ${MAX_WAIT_MS}ms`);
}

function readCredentials(): { username: string; password: string } {
  if (!existsSync(CREDS_FILE)) {
    throw new Error(
      `Credentials file not found at ${CREDS_FILE}. Check docker logs: docker logs crafty_test`
    );
  }
  const text = readFileSync(CREDS_FILE, "utf-8").trim();

  // Try "Username: X\nPassword: Y" format
  const userMatch = text.match(/[Uu]sername[:\s]+(\S+)/);
  const passMatch = text.match(/[Pp]assword[:\s]+(\S+)/);
  if (userMatch && passMatch) {
    return { username: userMatch[1]!, password: passMatch[1]! };
  }

  // Try JSON format: {"username":"admin","password":"xxx"}
  try {
    const json = JSON.parse(text) as Record<string, string>;
    if (json["username"] && json["password"]) {
      return { username: json["username"]!, password: json["password"]! };
    }
  } catch { /* not JSON */ }

  // Fallback: single-line password, username=admin
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 1) {
    return { username: "admin", password: lines[0]! };
  }

  throw new Error(`Cannot parse credentials from ${CREDS_FILE}. Contents:\n${text}`);
}

async function getAuthToken(username: string, password: string): Promise<string> {
  const res = await fetch(`${CRAFTY_URL}/api/v2/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  } as RequestInit);
  const json = await res.json() as Record<string, unknown>;
  if (json["status"] === "error") {
    throw new Error(`Login failed: ${JSON.stringify(json)}`);
  }
  const data = (json as { data: { token: string } }).data;
  return data.token;
}

export default async function globalSetup(): Promise<void> {
  // Ensure config dir exists (Crafty creates creds.txt here on first boot)
  mkdirSync(CONFIG_DIR, { recursive: true });

  console.log("\n[integration] Starting Crafty container...");
  execSync(`docker compose -f ${COMPOSE_FILE} up -d`, { stdio: "inherit" });

  console.log("[integration] Waiting for Crafty to be ready...");
  // Disable TLS verification for self-signed cert
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  await waitForCrafty();
  console.log("[integration] Crafty is ready.");

  const { username, password } = readCredentials();
  console.log(`[integration] Logging in as '${username}'...`);
  const token = await getAuthToken(username, password);

  writeFileSync(
    SESSION_FILE,
    JSON.stringify({ url: CRAFTY_URL, token }, null, 2)
  );
  console.log("[integration] Auth token obtained. Session written to .test-session.json");
}
