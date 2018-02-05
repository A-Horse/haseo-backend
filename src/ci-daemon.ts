import { Subject } from 'rxjs/Subject';
import { ProjectManager } from './module/project/project-manager';
import { TaskManager } from './module/task/task-manager';
import { ObserverManager } from './module/observer/observer-manager';
import { ReportManager } from 'src/module/report/report-manager';
import { Project } from 'src/module/project/project';
import { ProjectWithMeta } from 'src/module/project/product.module';

export class CIDaemon {
  public projectManager: ProjectManager = new ProjectManager();
  public getProjects = this.projectManager.getProjects;
  public getProjectByName = this.projectManager.getProjectByName;
  public mapOutRunProject = this.projectManager.mapOutRunProject;

  public reportManager: ReportManager = new ReportManager();
  public getProjectRunReportHistory = this.reportManager.getProjectRunReportHistory;
  public getProjectLastRunReportHistory = this.reportManager.getProjectLastRunReportHistory;
  public getProjectRunReport = this.reportManager.getProjectRunReport;

  public taskManager: TaskManager;
  private taskEvent$ = new Subject<{ type: string; payload: any }>();
  private observerManager: ObserverManager = new ObserverManager();

  public startup(): void {
    this.taskManager = new TaskManager(this.taskEvent$);

    this.taskManager.start();
    this.projectManager.initial();

    this.observerManager.watchProjects(this.projectManager.getProjects());

    this.observerManager
      .getShouldRUnProjectStream()
      .subscribe((projectWithMeta: ProjectWithMeta) => {
        this.taskManager.addToQueue(projectWithMeta);
      });

    this.projectManager.runProjectWithMeta$.subscribe((toRunProjectWithMata: ProjectWithMeta) => {
      this.taskManager.addToQueue(toRunProjectWithMata);
    });
  }
}
