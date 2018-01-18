import ProjectManager from './module/project/project-manager';
import TaskManager from './module/project/task-manager';

export class CIDaemon {
  constructor() {
    this.taskManager = new TaskManager();
    this.projectManager = new ProjectManager();
  }

  startup() {}

  restart() {}
}
