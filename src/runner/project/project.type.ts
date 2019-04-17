import { RepoVersion } from '../observer/observer.module';
import { Project } from './project';

export declare interface ProjectRunReportRow {
  id: number;
  projectName: string;
  startDate: string;
  commitHash: string;
  repoPullOutput: string;
  result: string;
  status: ReportStatus;
}

export interface ProjectWithMeta {
  version: RepoVersion;
  project: Project;
}

export interface ProjectSetting {
  name: string;
  flow: object[];
  toggle: 'MANUAL' | 'WATCH' | 'SCHEDUE';
  schedue?: string;
  useGit: boolean;
}
