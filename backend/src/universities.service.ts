import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface UniversityOverview {
  id: string;
  name: string;
  city: string;
  programs: string[];
  mapLabel: string;
}

@Injectable()
export class UniversitiesService {
  private readonly dataPath = join(process.cwd(), 'data', 'universities.json');

  async list(): Promise<UniversityOverview[]> {
    const payload = await readFile(this.dataPath, 'utf8');
    return JSON.parse(payload) as UniversityOverview[];
  }
}
