const express = require("express");
const universityRoutes = require("./routes/universities");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/universities", universityRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : "Internal server error.",
    details: error.details
  });
});

module.exports = app;
