// SPDX-FileCopyrightText: Hadi Cherkaoui <contact@hide.cherkaoui.ch>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { CraftyConfig, CraftyApiError, CraftyResponse } from "./types.js";

export class CraftyClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;

  constructor(config: CraftyConfig) {
    // Strip trailing slashes; /api/v2 is added per-request
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.apiToken;
    this.timeout = config.timeout;

    if (config.allowInsecure) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v2${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const json = (await response.json()) as Record<string, unknown>;

      if (json["status"] === "error") {
        throw new CraftyApiError(
          response.status,
          (json["error"] as string) || "UNKNOWN_ERROR",
          json["error_data"] as string | undefined
        );
      }

      return (json as unknown as CraftyResponse<T>).data;
    } catch (error) {
      if (error instanceof CraftyApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(
          `Request to ${url} timed out after ${this.timeout}ms`
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  async put<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("DELETE", path, body);
  }

  /**
   * Send a raw (plain-text) body to the Crafty API.
   *
   * The /stdin endpoint expects the console command as a plain-text
   * body with Content-Type: text/plain.  Using the normal post()
   * method wraps the command in JSON, which the server console
   * can't parse ("Unknown or incomplete command").
   */
  async postRaw<T = unknown>(path: string, rawBody: string): Promise<T> {
    const url = `${this.baseUrl}/api/v2${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "text/plain",
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: rawBody,
        signal: controller.signal,
      });

      const json = (await response.json()) as Record<string, unknown>;

      if (json["status"] === "error") {
        throw new CraftyApiError(
          response.status,
          (json["error"] as string) || "UNKNOWN_ERROR",
          json["error_data"] as string | undefined
        );
      }

      const data = (json as unknown as CraftyResponse<T>).data;
      return (data !== undefined ? data : json) as T;
    } catch (error) {
      if (error instanceof CraftyApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(
          `Request to ${url} timed out after ${this.timeout}ms`
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Login does NOT send a bearer token — it authenticates and returns one.
   * Endpoint: POST /api/v2/auth/login (NOT /api/v2/login)
   */
  async login(
    username: string,
    password: string,
    totp?: string
  ): Promise<{ token: string; user_id: number }> {
    const url = `${this.baseUrl}/api/v2/auth/login`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const bodyObj: Record<string, string> = { username, password };
      if (totp) bodyObj["totp"] = totp;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
        signal: controller.signal,
      });

      const json = (await response.json()) as Record<string, unknown>;
      if (json["status"] === "error") {
        throw new CraftyApiError(
          response.status,
          json["error"] as string,
          json["error_data"] as string | undefined
        );
      }
      return (json as unknown as CraftyResponse<{ token: string; user_id: number }>).data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
