import ProjectManager from './module/project/project-manager';
import TaskManager from './module/task/task-manager';
import { ObserverManager } from './module/observer/observer-manager';
import { ProjectWithPullResult } from './module/observer/observer.module';

export class CIDaemon {
  public taskManager: TaskManager;
  public projectManager: ProjectManager;
  private observerManager: ObserverManager;

  public startup(): void {
    this.taskManager = new TaskManager();
    this.projectManager = new ProjectManager();
    this.observerManager = new ObserverManager();

    this.observerManager.watchProjects(this.projectManager.getProjects());

    this.observerManager
      .getShouldRUnProjectStream()
      .subscribe((projectWithPullResult: ProjectWithPullResult) => {
        this.taskManager.addToQueue(projectWithPullResult);
      });
  }
}
