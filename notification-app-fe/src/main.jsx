import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "./index.css";
import App from "./App.jsx";
import { setApiToken } from "./api/notifications";
import { setAuthToken, setLogApiBaseUrl } from "../../logging-middleware/src/index.ts";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkZXZhbmFuZC4xMDYwNkBnbWFpbC5jb20iLCJleHAiOjE3ODE2Nzk0NTQsImlhdCI6MTc4MTY3ODU1NCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6Ijg0ZjYyMDZjLWNhOTMtNDU4Yy1hMjRlLThlZTcwOGJmNDZmOSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImRldmFuYW5kIHYiLCJzdWIiOiI5MzIzY2VhYS1iMDZiLTQxZWEtYjRhNS1lM2Y4MWU1YTAyMDkifSwiZW1haWwiOiJkZXZhbmFuZC4xMDYwNkBnbWFpbC5jb20iLCJuYW1lIjoiZGV2YW5hbmQgdiIsInJvbGxObyI6IjEyNzU0IiwiYWNjZXNzQ29kZSI6Imp1RnBodiIsImNsaWVudElEIjoiOTMyM2NlYWEtYjA2Yi00MWVhLWI0YTUtZTNmODFlNWEwMjA5IiwiY2xpZW50U2VjcmV0IjoiVmZ2dXN4cmpHQmN1VXpkcCJ9.ptF80U6RsAT8Oj9GANJD5cFd0JQ-OWbB02R20JMK0-Y";

setApiToken(TOKEN);
setAuthToken(TOKEN);
setLogApiBaseUrl("/evaluation-service/logs");

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#7b1fa2" },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
