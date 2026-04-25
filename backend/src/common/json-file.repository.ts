import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface JsonEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

type EntityInput<T extends JsonEntity> = Omit<T, keyof JsonEntity> & Partial<JsonEntity>;

export class JsonFileRepository<T extends JsonEntity> {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async findAll(): Promise<T[]> {
    return this.readAll();
  }

  async findById(id: string): Promise<T | undefined> {
    const entities = await this.readAll();
    return entities.find((entity) => entity.id === id);
  }

  async create(input: EntityInput<T>): Promise<T> {
    const now = new Date().toISOString();
    const entity = {
      ...input,
      id: input.id ?? randomUUID(),
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    } as T;

    await this.withWriteLock(async () => {
      const entities = await this.readAll();
      entities.push(entity);
      await this.writeAll(entities);
    });

    return entity;
  }

  async replace(id: string, input: EntityInput<T>): Promise<T | undefined> {
    let updated: T | undefined;

    await this.withWriteLock(async () => {
      const entities = await this.readAll();
      const index = entities.findIndex((entity) => entity.id === id);
      if (index === -1) {
        return;
      }

      updated = {
        ...input,
        id,
        createdAt: input.createdAt ?? entities[index].createdAt,
        updatedAt: new Date().toISOString(),
      } as T;

      entities[index] = updated;
      await this.writeAll(entities);
    });

    return updated;
  }

  async patch(id: string, input: Partial<EntityInput<T>>): Promise<T | undefined> {
    let updated: T | undefined;

    await this.withWriteLock(async () => {
      const entities = await this.readAll();
      const index = entities.findIndex((entity) => entity.id === id);
      if (index === -1) {
        return;
      }

      updated = {
        ...entities[index],
        ...input,
        id,
        createdAt: entities[index].createdAt,
        updatedAt: new Date().toISOString(),
      } as T;

      entities[index] = updated;
      await this.writeAll(entities);
    });

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;

    await this.withWriteLock(async () => {
      const entities = await this.readAll();
      const nextEntities = entities.filter((entity) => entity.id !== id);
      deleted = nextEntities.length !== entities.length;

      if (deleted) {
        await this.writeAll(nextEntities);
      }
    });

    return deleted;
  }

  private async readAll(): Promise<T[]> {
    try {
      const content = await readFile(this.filePath, 'utf8');
      const data: unknown = JSON.parse(content);

      if (!Array.isArray(data)) {
        throw new Error(`JSON repository file must contain an array: ${this.filePath}`);
      }

      return data as T[];
    } catch (error) {
      if (this.isMissingFile(error)) {
        await this.writeAll([]);
        return [];
      }

      throw error;
    }
  }

  private async writeAll(entities: T[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(entities, null, 2)}\n`, 'utf8');
  }

  private async withWriteLock(action: () => Promise<void>): Promise<void> {
    const currentWrite = this.writeQueue.then(action, action);
    this.writeQueue = currentWrite.catch(() => undefined);
    await currentWrite;
  }

  private isMissingFile(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
  }
}
