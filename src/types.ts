// Crafty API standard response envelope
export interface CraftyResponse<T = unknown> {
  status: "ok";
  data: T;
}

export interface CraftyError {
  status: "error";
  error: string;
  error_data?: string;
}

export type CraftyApiResponse<T = unknown> = CraftyResponse<T> | CraftyError;

// Typed error for failed API calls
export class CraftyApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    public errorData?: string
  ) {
    super(
      `Crafty API error ${statusCode}: ${errorCode}${errorData ? ` - ${errorData}` : ""}`
    );
    this.name = "CraftyApiError";
  }
}

// Client configuration (populated from env vars in index.ts)
export interface CraftyConfig {
  baseUrl: string;
  apiToken: string;
  allowInsecure: boolean;
  timeout: number;
}
