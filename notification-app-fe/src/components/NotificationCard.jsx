import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";

const TYPE_COLORS = {
  Placement: "primary",
  Result: "success",
  Event: "warning",
};

export function NotificationCard({ notification, isNew }) {
  const { Type, Message, Timestamp } = notification;

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: 4,
        borderLeftColor: isNew ? `${TYPE_COLORS[Type]}.main` : "grey.300",
        backgroundColor: isNew ? "action.hover" : "background.paper",
        transition: "background-color 0.2s",
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
          <Chip
            label={Type}
            size="small"
            color={TYPE_COLORS[Type]}
            variant={isNew ? "filled" : "outlined"}
          />
          <Typography variant="caption" color="text.secondary">
            {Timestamp}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.primary">
          {Message}
        </Typography>
      </CardContent>
    </Card>
  );
}
