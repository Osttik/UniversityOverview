export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  students: number;
  programs: string[];
  founded: number;
  website?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
