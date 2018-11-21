import * as R from 'ramda';
import { Subject } from 'rxjs/Subject';
import { Project } from '../project/project';
import { Observer } from '../observer/observer';
import { ProjectWithMeta } from '../project/project.module';
import { CronAgent } from './cron-agent';

// TODO 抽基类
export class SchedueManager {
  private shouldRunProjectWithMeta$ = new Subject<ProjectWithMeta>();
  private cronAgents: CronAgent[];

  public schedueProjects(projects: Project[]): void {
    this.cronAgents = this.filterProjectShouldSchedueRun(projects).map((project: Project): CronAgent => {
      return new CronAgent(project);
    });
    this.startObservers(this.cronAgents);
  }

  public findObserverByProjectName(projectName: string): Observer {
    return R.find((observer: Observer) => {
      return observer.getObserveProject().name === projectName;
    }, this.cronAgents);
  }

  public getShouldRunProjectStream(): Subject<ProjectWithMeta> {
    return this.shouldRunProjectWithMeta$;
  }

  private startObservers(cronAgents: CronAgent[]): void {
    cronAgents.forEach(cronAgent => {
      cronAgent.runCron().subscribe((projectWithMeta: ProjectWithMeta) => {
        this.shouldRunProjectWithMeta$.next(projectWithMeta);
      });
    });
  }

  private filterProjectShouldSchedueRun(projects: Project[]) {
    return projects.filter(project => project.getSetting().toggle === 'SCHEDUE');
  }
}