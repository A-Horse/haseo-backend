import { RepoVersion } from 'src/module/observer/observer.module';
import { Project } from 'src/platform/project/project';

export interface ProjectWithMeta {
  version: RepoVersion;
  project: Project;
}

export interface ProjectSetting {
  name: string;
  flow: object[];
  watch?: boolean;
}
