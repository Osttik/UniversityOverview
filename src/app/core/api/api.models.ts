export interface ApiCollection<T> {
  items: T[];
  total: number;
}

export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  website?: string;
  rank?: number;
  tags: string[];
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  degree: 'bachelor' | 'master' | 'doctorate' | 'certificate';
  durationMonths: number;
  tuitionUsd?: number;
  language: string;
  applicationDeadline?: string;
}

export interface Application {
  id: string;
  programId: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export type ApplicationStatus = 'draft' | 'submitted' | 'reviewing' | 'accepted' | 'rejected';

export interface UniversitySearchParams {
  query?: string;
  country?: string;
  city?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface ProgramSearchParams {
  universityId?: string;
  query?: string;
  degree?: Program['degree'];
  language?: string;
  page?: number;
  pageSize?: number;
}

export type CreateApplicationRequest = Pick<
  Application,
  'programId' | 'applicantName' | 'applicantEmail'
>;
