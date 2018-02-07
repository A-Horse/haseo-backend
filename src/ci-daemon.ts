import { Subject } from 'rxjs/Subject';
import { ProjectManager } from './platform/project/project-manager';
import { TaskManager } from './platform/task/task-manager';
import { ObserverManager } from './platform/observer/observer-manager';
import { ReportManager } from 'src/platform/report/report-manager';
import { Project } from 'src/platform/project/project';
import { ProjectWithMeta } from 'src/platform/project/project.module';

// tslint:disable:member-ordering
export class CIDaemon {
  private projectManager: ProjectManager = new ProjectManager();
  public getProjects = this.projectManager.getProjects;
  public getProjectByName = this.projectManager.getProjectByName;
  public mapOutRunProject = this.projectManager.mapOutRunProject;

  private reportManager: ReportManager = new ReportManager();
  public getProjectRunReportHistory = this.reportManager.getProjectRunReportHistory;
  public getProjectLastRunReportHistory = this.reportManager.getProjectLastRunReportHistory;
  public getProjectRunReport = this.reportManager.getProjectRunReport;

  private taskManager: TaskManager = new TaskManager();
  public queryTaskRunnerOutputPartByReportId = this.taskManager.queryTaskRunnerOutputPartByReportId;
  private observerManager: ObserverManager = new ObserverManager();

  public startup(): void {
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
