import { Subject } from 'rxjs/Subject';
import { ProjectManager } from './project/project-manager';
import { TaskManager } from './task/task-manager';
import { ObserverManager } from './observer/observer-manager';
import { ReportManager } from './report/report-manager';
import { Project } from './project/project';
import { ProjectWithMeta } from './project/project.type';
import { SchedueManager } from './schedue/schedue-manager';

// tslint:disable:member-ordering
export class CIDaemon {
  public projectManager: ProjectManager = new ProjectManager();
  public getProjects = this.projectManager.getProjects.bind(this.projectManager);
  public getProjectByName = this.projectManager.getProjectByName.bind(this.projectManager);
  public mapOutRunProject = this.projectManager.mapOutRunProject.bind(this.projectManager);
  public getProjectCommitMessageByHash = this.projectManager.getProjectCommitMessageByHash.bind(
    this.projectManager
  );

  public reportManager: ReportManager = new ReportManager();
  public getProjectRunReportHistory = this.reportManager.getProjectRunReportHistory.bind(
    this.reportManager
  );
  public getProjectLastRunReport = this.reportManager.getProjectLastRunReport.bind(
    this.reportManager
  );
  public getProjectRunReport = this.reportManager.getProjectRunReport.bind(this.reportManager);

  public taskManager: TaskManager = new TaskManager();
  public queryTaskRunnerOutputPartByReportId = this.taskManager.queryTaskRunnerOutputPartByReportId.bind(
    this.taskManager
  );
  public getTaskEvent$ = this.taskManager.getTaskEvent$.bind(this.taskManager);

  public observerManager: ObserverManager = new ObserverManager();
  public schedueManager: SchedueManager = new SchedueManager();

  public startup(): void {
    this.taskManager.start();
    this.projectManager.initial();

    this.observerManager.watchProjects(this.projectManager.getProjects());

    this.observerManager
      .getShouldRunProjectStream()
      .subscribe((projectWithMeta: ProjectWithMeta) => {
        this.taskManager.addToQueue(projectWithMeta);
      });

    this.schedueManager.schedueProjects(this.projectManager.getProjects());

    this.schedueManager
      .getShouldRunProjectStream()
      .subscribe((projectWithMeta: ProjectWithMeta) => {
        this.taskManager.addToQueue(projectWithMeta);
      });

    this.projectManager.runProjectWithMeta$.subscribe((toRunProjectWithMata: ProjectWithMeta) => {
      this.taskManager.addToQueue(toRunProjectWithMata);
    });
  }
}
