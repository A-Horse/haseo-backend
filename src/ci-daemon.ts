import { Subject } from 'rxjs/Subject';
import { ProjectManager } from './platform/project/project-manager';
import { TaskManager } from './platform/task/task-manager';
import { ObserverManager } from './platform/observer/observer-manager';
import { ReportManager } from './platform/report/report-manager';
import { Project } from './platform/project/project';
import { ProjectWithMeta } from './platform/project/project.module';

// tslint:disable:member-ordering
export class CIDaemon {
  private projectManager: ProjectManager = new ProjectManager();
  public getProjects = this.projectManager.getProjects.bind(this.projectManager);
  public getProjectByName = this.projectManager.getProjectByName.bind(this.projectManager);
  public mapOutRunProject = this.projectManager.mapOutRunProject.bind(this.projectManager);

  private reportManager: ReportManager = new ReportManager();
  public getProjectRunReportHistory = this.reportManager.getProjectRunReportHistory.bind(
    this.reportManager
  );
  public getProjectLastRunReportHistory = this.reportManager.getProjectLastRunReportHistory.bind(
    this.reportManager
  );
  public getProjectRunReport = this.reportManager.getProjectRunReport.bind(this.reportManager);

  private taskManager: TaskManager = new TaskManager();
  public queryTaskRunnerOutputPartByReportId = this.taskManager.queryTaskRunnerOutputPartByReportId.bind(
    this.taskManager
  );
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
