import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { isNew, markMultipleAsViewed } from "../utils/viewTracker";
import { Log } from "../../../logging-middleware/src/index.ts";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { notifications, totalPages, loading, error, total } = useNotifications({
    limit: 10,
    page,
    notificationType: filter,
  });

  const unreadCount = notifications.filter((n) => isNew(n.ID)).length;

  useEffect(() => {
    if (notifications.length > 0) {
      const ids = notifications.map((n) => n.ID);
      markMultipleAsViewed(ids);
      Log("frontend", "info", "page", `Marked ${ids.length} notifications as viewed on All Notifications page`);
    }
  }, [notifications]);

  useEffect(() => {
    Log("frontend", "info", "page", `All Notifications page rendered: filter=${filter}, page=${page}`);
  }, [filter, page]);

  const handleFilterChange = (newFilter) => {
    Log("frontend", "debug", "page", `Filter changed to: ${newFilter}`);
    setFilter(newFilter);
    setPage(1);
  };

  const handlePageChange = (_, newPage) => {
    Log("frontend", "debug", "page", `Page changed to: ${newPage}`);
    setPage(newPage);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
        {!loading && (
          <Typography variant="body2" color="text.secondary">
            ({total} total)
          </Typography>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ marginBottom: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">
          Failed to load notifications: {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <NotificationCard key={n.ID} notification={n} isNew={isNew(n.ID)} />
          ))}
        </Stack>
      )}

      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
