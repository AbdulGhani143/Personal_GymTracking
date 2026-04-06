require("dotenv").config();

const axios = require("axios");
const { execSync } = require("child_process");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;
const KEEP_ALIVE_INTERVAL_MS = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 14 * 60 * 1000;

const startKeepAlive = () => {
  if (!KEEP_ALIVE_URL) {
    return;
  }

  setInterval(async () => {
    try {
      await axios.get(KEEP_ALIVE_URL, {
        timeout: 5000,
      });
    } catch (error) {
      console.warn("Keep-alive ping failed:", error.message);
    }
  }, KEEP_ALIVE_INTERVAL_MS).unref();
};

const killPort = (port) => {
  try {
    if (process.platform === "win32") {
      const output = execSync(
        `netstat -ano | findstr :${port} | findstr LISTENING`,
        { encoding: "utf8", timeout: 5000 }
      );
      const lines = output.trim().split("\n");
      const pids = new Set();
      for (const line of lines) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== "0" && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { timeout: 3000 });
          console.log(`Killed stale process ${pid} on port ${port}`);
        } catch {}
      }
    }
  } catch {}
};

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", async (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${PORT} in use — killing stale process and retrying...`);
        killPort(PORT);
        await new Promise((r) => setTimeout(r, 1000));
        server.listen(PORT, () => {
          console.log(`Server running on port ${PORT} (retry succeeded)`);
        });
      } else {
        console.error("Server error:", err.message);
        process.exit(1);
      }
    });

    startKeepAlive();
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
