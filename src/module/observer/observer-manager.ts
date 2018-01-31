import Project from 'src/module/project/project';
import Observer from 'src/module/observer/observer';
import { Subject } from 'rxjs/Subject';

export class ObserverManager {
  public shouldRunProject$ = new Subject<Project>();
  private observers: Observer[];

  public watchProjects(projects: Project[]) {
    this.observers = this.findProjectShouldObserve(projects).map((project: Project): Observer => {
      return new Observer(project);
    });

    this.observers.forEach(observer => {
      observer.start().subscribe(project => {});
    });
  }

  private findProjectShouldObserve(projects: Project[]) {
    return projects.filter(project => project.getProjectSetting().watch);
  }
}
