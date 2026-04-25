import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { University } from '@university-overview/shared';

@Injectable()
export class UniversitiesService {
  private readonly dataPath = join(process.cwd(), 'apps', 'api', 'data', 'universities.json');

  findAll(): University[] {
    const raw = readFileSync(this.dataPath, 'utf8');
    return JSON.parse(raw) as University[];
  }
}
