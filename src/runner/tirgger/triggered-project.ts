import { Project } from "../../runner/project/project";

export enum TriggerType {
  SCHEDUE = 'SCHEDUE',
  GIT = 'GIT',
  ONCE = 'ONCE',
  MANUAL = 'MANUAL'
}

export interface TriggeredProjectMeta {
  output?: string;
  gitCommits?: string[];
}

export class TriggeredProject {
  constructor(
      public project: Project,
      public triggerBy: TriggerType,
      public meta: TriggeredProjectMeta = {}
  ) {}
}