let LOG_API = "http://4.224.186.213/evaluation-service/logs";

export function setLogApiBaseUrl(url: string) {
  LOG_API = url;
}

export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

export type Package =
  | "cache" | "controller" | "cron_job" | "db" | "domain"
  | "handler" | "repository" | "route" | "service"
  | "api" | "component" | "hook" | "page" | "state" | "style"
  | "auth" | "config" | "middleware" | "utils";

export type LogPayload = {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
};

let _token: string | null = null;

export function setAuthToken(token: string) {
  _token = token;
}

export function getAuthToken(): string | null {
  return _token;
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<{ logID: string } | null> {
  const token = _token;
  if (!token) {
    console.warn("[logging-middleware] No auth token set. Call setAuthToken() first.");
    return null;
  }

  try {
    const res = await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      } satisfies LogPayload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[logging-middleware] Log API error (${res.status}): ${errorBody}`);
      return null;
    }

    return await res.json() as { logID: string };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[logging-middleware] Network error: ${msg}`);
    return null;
  }
}
