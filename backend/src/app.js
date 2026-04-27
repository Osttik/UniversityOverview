const express = require("express");
const cors = require("cors");

const facultiesRouter = require("./routes/faculties.routes");
const programsRouter = require("./routes/programs.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/faculties", facultiesRouter);
app.use("/api/programs", programsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  res.status(status).json({ error: message });
});

module.exports = app;
