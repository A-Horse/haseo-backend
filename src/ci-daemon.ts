import { Subject } from 'rxjs/Subject';
import { ProjectManager } from './module/project/project-manager';
import { TaskManager } from './module/task/task-manager';
import { ObserverManager } from './module/observer/observer-manager';
import { ProjectWithPullResult } from './module/observer/observer.module';

export class CIDaemon {
  public projectManager: ProjectManager = new ProjectManager();
  public getProjects = this.projectManager.getProjects;
  public getProjectByName = this.projectManager.getProjectByName;
  public getProjectRunReportHistory = this.projectManager.getProjectRunReportHistory;
  public taskManager: TaskManager;
  private taskEvent$ = new Subject<{ type: string; payload: any }>();
  private observerManager: ObserverManager = new ObserverManager();

  public startup(): void {
    this.taskManager = new TaskManager(this.taskEvent$);
    this.projectManager.initial();
    this.observerManager.watchProjects(this.projectManager.getProjects());

    this.observerManager
      .getShouldRUnProjectStream()
      .subscribe((projectWithPullResult: ProjectWithPullResult) => {
        this.taskManager.addToQueue(projectWithPullResult);
      });
  }
}
