export type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
  durationMs: number;
};

export type ApiFailure = {
  ok: false;
  status: number | null;
  error: string;
  durationMs: number;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

const DEFAULT_BASE_URL = "http://127.0.0.1:3001";
const DEFAULT_TIMEOUT_MS = 5000;

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

export function getApiTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_API_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : DEFAULT_TIMEOUT_MS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export function buildApiUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
  const base = getApiBaseUrl();
  const url = new URL(path, base);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function fetchJson<T>(
  url: string,
  options?: {
    timeoutMs?: number;
    init?: RequestInit;
  }
): Promise<ApiResult<T>> {
  const { timeoutMs = 8000, init } = options ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const durationMs = Math.round(performance.now() - started);
    const contentType = response.headers.get("content-type") ?? "";
    let payload: unknown = null;

    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload && "message" in payload
          ? String((payload as { message?: string }).message)
          : typeof payload === "string"
            ? payload
            : response.statusText || "Request failed";

      return {
        ok: false,
        status: response.status,
        error: message,
        durationMs,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload as T,
      durationMs,
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchApiJson<T>(
  path: string,
  options?: {
    query?: Record<string, string | number | boolean | undefined | null>;
    timeoutMs?: number;
    init?: RequestInit;
  }
): Promise<T> {
  const { query, timeoutMs, init } = options ?? {};
  const result = await fetchJson<T>(buildApiUrl(path, query), {
    timeoutMs: timeoutMs ?? getApiTimeoutMs(),
    init,
  });
  if (!result.ok) {
    throw new Error(result.error || "Request failed");
  }
  return result.data;
}
