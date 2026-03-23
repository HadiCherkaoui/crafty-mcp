import { execSync } from "child_process";
import { existsSync, unlinkSync, rmSync } from "fs";

const COMPOSE_FILE = "tests/docker-compose.test.yml";
const SESSION_FILE = ".test-session.json";

export async function teardown(): Promise<void> {
  console.log("\n[integration] Stopping Crafty container...");
  execSync(`docker compose -f ${COMPOSE_FILE} down -v`, { stdio: "inherit" });

  if (existsSync(SESSION_FILE)) unlinkSync(SESSION_FILE);
  if (existsSync("tests/docker")) rmSync("tests/docker", { recursive: true, force: true });
  console.log("[integration] Cleanup complete.");
}
