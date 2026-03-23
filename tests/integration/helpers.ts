import { readFileSync } from "fs";
import { CraftyClient } from "../../src/client.js";

interface Session {
  url: string;
  token: string;
}

export function getSession(): Session {
  const raw = readFileSync(".test-session.json", "utf-8");
  return JSON.parse(raw) as Session;
}

export function getClient(): CraftyClient {
  const { url, token } = getSession();
  return new CraftyClient({
    baseUrl: url,
    apiToken: token,
    allowInsecure: true,
    timeout: 15000,
  });
}
