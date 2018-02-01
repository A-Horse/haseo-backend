import * as R from 'ramda';
import Project from 'src/module/project/project';
import Observer from 'src/module/observer/observer';
import { Subject } from 'rxjs/Subject';
import { ProjectWithPullResult } from 'src/module/observer/observer.module';

export class ObserverManager {
  private shouldRunProject$ = new Subject<Project>();
  private observers: Observer[];

  public watchProjects(projects: Project[]) {
    this.observers = this.findProjectShouldObserve(projects).map((project: Project): Observer => {
      return new Observer(project);
    });
    this.startObservers(this.observers);
  }

  public findObserverByProjectName(projectName: string): Observer {
    return R.find((observer: Observer) => {
      return observer.getObserveProject().name === projectName;
    }, this.observers);
  }

  public getShouldRUnProjectStream(): Subject<Project> {
    return this.shouldRunProject$;
  }

  private startObservers(observers: Observer[]): void {
    observers.forEach(observer => {
      observer.pollToPullRepo().subscribe((projectWithPullResult: ProjectWithPullResult) => {
        this.shouldRunProject$.next(projectWithPullResult.project);
      });
    });
  }

  private findProjectShouldObserve(projects: Project[]) {
    return projects.filter(project => project.getProjectSetting().watch);
  }
}
