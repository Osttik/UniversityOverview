import cors from "cors";
import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import morgan from "morgan";

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  students: number;
  programs: string[];
  founded: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.resolve(__dirname, "../data/universities.json");
const port = Number(process.env.PORT ?? 3000);

async function readUniversities(): Promise<University[]> {
  const raw = await readFile(dataFile, "utf-8");
  return JSON.parse(raw) as University[];
}

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "university-overview-api" });
});

app.get("/api/universities", async (_request, response, next) => {
  try {
    response.json(await readUniversities());
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    response.status(500).json({ error: message });
  }
);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`University Overview API listening on http://localhost:${port}`);
  });
}
