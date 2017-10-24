import ProjectManager from './lib/project-manager';
import TaskManager from './lib/task-manager';

export class CIDaemon {
  constructor() {
    this.taskManager = new TaskManager();
    this.projectManager = new ProjectManager();
  }

  startup() {}

  restart() {}
}
