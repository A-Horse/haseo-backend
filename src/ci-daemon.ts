import ProjectManager from './module/project/project-manager';
import TaskManager from './module/project/task-manager';

export class CIDaemon {
  taskManager: TaskManager = new TaskManager();
  projectManager: ProjectManager = new ProjectManager();

  constructor() {}

  startup() {}

  restart() {}
}
