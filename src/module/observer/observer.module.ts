import Project from 'src/module/project/project';

export interface PullResult {
  commitHash: string;
  output: string;
}

export interface ProjectWithPullResult {
  pullResult: PullResult;
  project: Project;
}
