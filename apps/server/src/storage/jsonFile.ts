import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import type { HttpError } from "../app.js";

export async function readJsonFile<T>(filePath: string, fallbackValue: T): Promise<T> {
  try {
    const contents = await readFile(filePath, "utf8");
    if (contents.trim().length === 0) {
      return fallbackValue;
    }

    return JSON.parse(contents) as T;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return fallbackValue;
    }

    if (error instanceof SyntaxError) {
      const invalidJsonError: HttpError = new Error(`Invalid JSON in ${filePath}`);
      invalidJsonError.code = "invalid_json_file";
      invalidJsonError.status = 500;
      throw invalidJsonError;
    }

    throw error;
  }
}

export async function writeJsonFileAtomic<T>(filePath: string, value: T): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });

  const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  const handle = await open(tempPath, "w");

  try {
    await handle.writeFile(payload, "utf8");
    await handle.sync();
    await handle.close();
    await rename(tempPath, filePath);
  } catch (error) {
    await handle.close().catch(() => undefined);
    await rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
