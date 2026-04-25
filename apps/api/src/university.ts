export interface University {
  id: string;
  name: string;
  city: string;
  region: string;
  founded: number;
  students: number;
  rating: number;
  tuitionUsd: number;
  categories: string[];
  programs: string[];
  highlights: string[];
  campus: {
    x: number;
    y: number;
    label: string;
  };
}

export interface UniversitySummary {
  totalUniversities: number;
  totalStudents: number;
  averageRating: number;
  regions: string[];
  categories: string[];
}
