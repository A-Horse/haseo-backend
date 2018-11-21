import { RepoVersion } from '../observer/observer.module';
import { Project } from './project';

export interface ProjectWithMeta {
  version: RepoVersion;
  project: Project;
}

export interface ProjectSetting {
  name: string;
  flow: object[];
  toggle: 'MANUAL' | 'WATCH' | 'SCHEDUE';
  schedue?: string;
}
