import dotenv from "dotenv";

dotenv.config();

function readPort(value: string | undefined) {
  const port = Number.parseInt(value ?? "3000", 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readPort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:4200"
};
