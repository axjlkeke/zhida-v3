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
