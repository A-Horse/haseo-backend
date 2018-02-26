import { Subject } from 'rxjs/Subject';
import { ProjectManager } from './project/project-manager';
import { TaskManager } from './task/task-manager';
import { ObserverManager } from './observer/observer-manager';
import { ReportManager } from './report/report-manager';
import { Project } from './project/project';
import { ProjectWithMeta } from './project/project.module';

// tslint:disable:member-ordering
export class CIDaemon {
  private projectManager: ProjectManager = new ProjectManager();
  public getProjects = this.projectManager.getProjects.bind(this.projectManager);
  public getProjectByName = this.projectManager.getProjectByName.bind(this.projectManager);
  public mapOutRunProject = this.projectManager.mapOutRunProject.bind(this.projectManager);
  public getProjectCommitMessageByHash = this.projectManager.getProjectCommitMessageByHash.bind(
    this.projectManager
  );

  private reportManager: ReportManager = new ReportManager();
  public getProjectRunReportHistory = this.reportManager.getProjectRunReportHistory.bind(
    this.reportManager
  );
  public getProjectLastRunReport = this.reportManager.getProjectLastRunReport.bind(
    this.reportManager
  );
  public getProjectRunReport = this.reportManager.getProjectRunReport.bind(this.reportManager);

  private taskManager: TaskManager = new TaskManager();
  public queryTaskRunnerOutputPartByReportId = this.taskManager.queryTaskRunnerOutputPartByReportId.bind(
    this.taskManager
  );
  public getTaskEvent$ = this.taskManager.getTaskEvent$.bind(this.taskManager);
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
