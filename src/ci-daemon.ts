import ProjectManager from './module/project/project-manager';
import TaskManager from './module/project/task-manager';
import { ObserverManager } from 'src/module/observer/observer-manager';

export class CIDaemon {
  public taskManager: TaskManager = new TaskManager();
  public projectManager: ProjectManager = new ProjectManager();
  private observerManager: ObserverManager = new ObserverManager();

  constructor() {}

  public startup(): void {
    this.observerManager.watchProjectByGit(this.projectManager.getProjects());
  }

  restart() {}
}
