import * as R from 'ramda';
import { Subject } from 'rxjs/Subject';
import { Project } from '../project/project';
import { Observer } from '../observer/observer';
import { ProjectWithMeta } from '../project/project.module';

// TODO 应该要和 schedue 抽一个基类
export class ObserverManager {
  private shouldRunProjectWithMeta$ = new Subject<ProjectWithMeta>();
  private observers: Observer[];

  public watchProjects(projects: Project[]): void {
    this.observers = this.filterProjectShouldObserve(projects).map((project: Project): Observer => {
      return new Observer(project);
    });
    this.startObservers(this.observers);
  }

  public findObserverByProjectName(projectName: string): Observer {
    return R.find((observer: Observer) => {
      return observer.getObserveProject().name === projectName;
    }, this.observers);
  }

  public getShouldRunProjectStream(): Subject<ProjectWithMeta> {
    return this.shouldRunProjectWithMeta$;
  }

  private startObservers(observers: Observer[]): void {
    observers.forEach(observer => {
      observer.pollToPullRepo().subscribe((projectWithMeta: ProjectWithMeta) => {
        this.shouldRunProjectWithMeta$.next(projectWithMeta);
      });
    });
  }

  private filterProjectShouldObserve(projects: Project[]) {
    return projects.filter(project => project.getSetting().toggle === 'WATCH');
  }
}
