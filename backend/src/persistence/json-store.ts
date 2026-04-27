import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export class JsonStore<T> {
  private writeQueue = Promise.resolve();

  constructor(
    private readonly filePath: string,
    private readonly defaultValue: T
  ) {}

  async initialize() {
    await mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await readFile(this.filePath, "utf8");
    } catch (error) {
      if (!isNodeError(error) || error.code !== "ENOENT") {
        throw error;
      }

      await this.write(this.defaultValue);
    }
  }

  async read(): Promise<T> {
    const contents = await readFile(this.filePath, "utf8");

    try {
      return JSON.parse(contents) as T;
    } catch (error) {
      if (error instanceof Error) {
        error.message = `Invalid JSON in ${this.filePath}: ${error.message}`;
      }
      throw error;
    }
  }

  async write(value: T) {
    return this.enqueueWrite(() => this.writeDirect(value));
  }

  async transaction<TResult>(
    callback: (store: { read: () => Promise<T>; write: (value: T) => Promise<void> }) => Promise<TResult>
  ) {
    return this.enqueueWrite(() =>
      callback({
        read: () => this.read(),
        write: (value) => this.writeDirect(value)
      })
    );
  }

  private enqueueWrite<TResult>(callback: () => Promise<TResult>) {
    const operation = this.writeQueue.then(callback, callback);
    this.writeQueue = operation.then(
      () => undefined,
      () => undefined
    );
    return operation;
  }

  private async writeDirect(value: T) {
    const payload = `${JSON.stringify(value, null, 2)}\n`;
    const temporaryFile = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;

    await writeFile(temporaryFile, payload, "utf8");
    await rename(temporaryFile, this.filePath);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
