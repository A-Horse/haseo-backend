import { RepoVersion } from 'src/module/observer/observer.module';
import { Project } from 'src/module/project/project';

export interface ProjectWithMeta {
  version: RepoVersion;
  project: Project;
}