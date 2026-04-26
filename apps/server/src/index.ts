import { createApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

export const app = createApp();

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`University Overview API listening on http://localhost:${port}`);
  });
}
