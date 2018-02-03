import ProjectManager from './module/project/project-manager';
import TaskManager from './module/task/task-manager';
import { ObserverManager } from './module/observer/observer-manager';
import { ProjectWithPullResult } from './module/observer/observer.module';
import { Subject } from 'rxjs/Subject';

export class CIDaemon {
  public taskManager: TaskManager;
  public projectManager: ProjectManager;
  private observerManager: ObserverManager;
  private taskEvent$ = new Subject<{ type: string; payload: any }>();

  public startup(): void {
    this.taskManager = new TaskManager(this.taskEvent$);
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
