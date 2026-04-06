const express = require("express");
const cors = require("cors");
const compression = require("compression");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const templateRoutes = require("./routes/templateRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  compression({
    threshold: 1024,
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/auth", authRoutes);
app.use("/templates", templateRoutes);
app.use("/workouts", workoutRoutes);
app.use("/exercises", exerciseRoutes);

// --- Serve frontend in production ---
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "frontend", "dist");
  app.use(express.static(frontendDist));

  // Any route that is NOT an API route → serve index.html (for React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

module.exports = app;
