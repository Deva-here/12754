import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

import { NotificationCard } from "../components/NotificationCard";
import { useNotifications } from "../hooks/useNotifications";
import { isNew } from "../utils/viewTracker";
import { Log } from "../../../logging-middleware/src/index.ts";

const LIMIT_OPTIONS = [5, 10, 15, 20];

export function PriorityNotificationsPage() {
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState("All");

  const { notifications, loading, error } = useNotifications({
    limit: 50,
    page: 1,
    notificationType: filter,
  });

  const topNotifications = notifications
    .slice()
    .sort((a, b) => {
      const weight = { Placement: 3, Result: 2, Event: 1 };
      const wa = weight[a.Type] || 0;
      const wb = weight[b.Type] || 0;
      if (wa !== wb) return wb - wa;
      return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
    })
    .slice(0, limit);

  const newCount = topNotifications.filter((n) => isNew(n.ID)).length;

  useEffect(() => {
    Log("frontend", "info", "page", `Priority Inbox page rendered: filter=${filter}, top=${limit}`);
  }, [filter, limit]);

  const handleLimitChange = (e) => {
    const val = e.target.value;
    Log("frontend", "debug", "page", `Priority limit changed to: ${val}`);
    setLimit(val);
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    Log("frontend", "debug", "page", `Priority filter changed to: ${val}`);
    setFilter(val);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <StarIcon sx={{ fontSize: 28, color: "warning.main" }} />
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
        {!loading && newCount > 0 && (
          <Typography variant="body2" color="primary">
            ({newCount} new)
          </Typography>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Show top</InputLabel>
          <Select
            value={limit}
            label="Show top"
            onChange={handleLimitChange}
          >
            {LIMIT_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type filter</InputLabel>
          <Select
            value={filter}
            label="Type filter"
            onChange={handleFilterChange}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && topNotifications.length === 0 && (
        <Alert severity="info">No priority notifications found.</Alert>
      )}

      {!loading && !error && topNotifications.length > 0 && (
        <Stack spacing={1.5}>
          {topNotifications.map((n, idx) => (
            <Box key={n.ID} display="flex" alignItems="flex-start" gap={1}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1.5, minWidth: 24, textAlign: "right" }}
              >
                #{idx + 1}
              </Typography>
              <Box flex={1}>
                <NotificationCard notification={n} isNew={isNew(n.ID)} />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
