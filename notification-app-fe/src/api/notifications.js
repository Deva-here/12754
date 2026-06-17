import { Log } from "../../../logging-middleware/src/index.ts";

const API_BASE = "/evaluation-service";

let _token = null;

export function setApiToken(token) {
  _token = token;
}

export async function fetchNotifications({ limit, page, notificationType } = {}) {
  const params = new URLSearchParams();
  if (limit != null) params.set("limit", String(limit));
  if (page != null) params.set("page", String(page));
  if (notificationType != null && notificationType !== "All") {
    params.set("notification_type", notificationType);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE}/notifications?${queryString}`
    : `${API_BASE}/notifications`;

  Log("frontend", "info", "api", `Fetching notifications [limit=${limit}, page=${page}, type=${notificationType}]`);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${_token}`,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      Log("frontend", "error", "api", `Notifications API error (${res.status}): ${errorBody}`);
      throw new Error(`API error (${res.status}): ${errorBody}`);
    }

    const data = await res.json();
    Log("frontend", "info", "api", `Notifications fetched successfully: ${data.notifications?.length ?? 0} items`);
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    Log("frontend", "error", "api", `Notifications fetch failed: ${msg}`);
    throw err;
  }
}
