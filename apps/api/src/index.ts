import cors from "cors";
import express from "express";
import { promises as fs } from "node:fs";
import { join } from "node:path";

type University = {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataFile = join(process.cwd(), "data", "universities.json");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "university-overview-api"
  });
});

app.get("/api/universities", async (_request, response, next) => {
  try {
    const payload = await fs.readFile(dataFile, "utf8");
    const universities = JSON.parse(payload) as University[];

    response.json({
      data: universities
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  response.status(500).json({
    error: "internal_server_error",
    message: error.message
  });
});

app.listen(port, () => {
  console.log(`University Overview API listening on port ${port}`);
});
