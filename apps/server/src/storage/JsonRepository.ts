import { randomUUID } from "node:crypto";
import type { HttpError } from "../app.js";
import { readJsonFile, writeJsonFileAtomic } from "./jsonFile.js";

type Entity = object;

interface JsonRepositoryOptions<T extends Entity> {
  filePath: string;
  idField?: keyof T & string;
}

export class JsonRepository<T extends Entity> {
  private readonly filePath: string;
  private readonly idField: keyof T & string;

  constructor({ filePath, idField = "id" as keyof T & string }: JsonRepositoryOptions<T>) {
    if (!filePath) {
      throw new Error("JsonRepository requires a filePath");
    }

    this.filePath = filePath;
    this.idField = idField;
  }

  async list(): Promise<T[]> {
    return this.readCollection();
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.readCollection();
    return items.find((item) => String(item[this.idField]) === String(id)) ?? null;
  }

  async create(input: T): Promise<T> {
    const items = await this.readCollection();
    const now = new Date().toISOString();
    const item = {
      ...input,
      [this.idField]: getField(input, this.idField) ?? randomUUID(),
      createdAt: getField(input, "createdAt") ?? now,
      updatedAt: getField(input, "updatedAt") ?? now
    } as T;

    items.push(item);
    await this.writeCollection(items);
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const items = await this.readCollection();
    const index = items.findIndex((item) => String(item[this.idField]) === String(id));

    if (index === -1) {
      return null;
    }

    const existing = items[index];
    const updated = {
      ...existing,
      ...patch,
      [this.idField]: getField(existing, this.idField),
      createdAt: getField(existing, "createdAt"),
      updatedAt: new Date().toISOString()
    } as T;

    items[index] = updated;
    await this.writeCollection(items);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const items = await this.readCollection();
    const nextItems = items.filter((item) => String(item[this.idField]) !== String(id));

    if (nextItems.length === items.length) {
      return false;
    }

    await this.writeCollection(nextItems);
    return true;
  }

  private async readCollection(): Promise<T[]> {
    const value = await readJsonFile<unknown>(this.filePath, []);
    if (!Array.isArray(value)) {
      const error: HttpError = new Error(`Expected ${this.filePath} to contain a JSON array`);
      error.code = "invalid_repository_file";
      error.status = 500;
      throw error;
    }

    return value as T[];
  }

  private async writeCollection(items: T[]): Promise<void> {
    await writeJsonFileAtomic(this.filePath, items);
  }
}

function getField(entity: object, field: string): unknown {
  return (entity as Record<string, unknown>)[field];
}
