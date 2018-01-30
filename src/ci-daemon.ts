import ProjectManager from './module/manager/project-manager';
import TaskManager from './module/project/task-manager';

export class CIDaemon {
  public taskManager: TaskManager = new TaskManager();
  public projectManager: ProjectManager = new ProjectManager();

  constructor() {}

  startup() {}

  restart() {}
}
