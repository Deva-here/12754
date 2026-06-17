import { useState, useEffect, useCallback } from "react";
import { Log } from "../../../logging-middleware/src/index.ts";
import { fetchNotifications } from "../api/notifications";

export function useNotifications({ limit = 10, page = 1, notificationType = "All" } = {}) {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Log("frontend", "debug", "hook", `Loading notifications: type=${notificationType}, page=${page}, limit=${limit}`);
    try {
      const data = await fetchNotifications({ notificationType });
      setAllNotifications(data.notifications ?? []);
      Log("frontend", "info", "hook", `Loaded ${data.notifications?.length ?? 0} notifications successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setAllNotifications([]);
      Log("frontend", "error", "hook", `Failed to load notifications: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [notificationType, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const total = allNotifications.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const notifications = allNotifications.slice(start, start + limit);

  return { notifications, total, totalPages, loading, error, refetch: load };
}
