import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { Log } from "../../logging-middleware/src/index.ts";

import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotificationsPage } from "./pages/PriorityNotificationsPage";
import "./App.css";

function NavBar() {
  const location = useLocation();

  useEffect(() => {
    Log("frontend", "info", "component", `Navigated to: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="md"> 
        <Toolbar disableGutters>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Campus Notifications
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<NotificationsIcon />}
            sx={{
              textTransform: "none",
              fontWeight: location.pathname === "/" ? 700 : 400,
              borderBottom: location.pathname === "/" ? 2 : 0,
              borderRadius: 0,
            }}
          >
            All
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/priority"
            startIcon={<StarIcon />}
            sx={{
              textTransform: "none",
              fontWeight: location.pathname === "/priority" ? 700 : 400,
              borderBottom: location.pathname === "/priority" ? 2 : 0,
              borderRadius: 0,
            }}
          >
            Priority
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Box className="app-container">
        <NavBar />
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Routes>
            <Route path="/" element={<NotificationsPage />} />
            <Route path="/priority" element={<PriorityNotificationsPage />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}
