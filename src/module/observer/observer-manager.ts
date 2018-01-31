import Project from 'src/module/project/project';
import Observer from 'src/module/observer/observer';
import { Subject } from 'rxjs/Subject';

export class ObserverManager {
  private;
  private shouldRunProject$ = new Subject();

  public watchProjectByGit(projects: Project[]) {
    this.findProjectShouldObserve(projects).forEach((project: Project) => {
      const observer = new ObserverGit(project);
      observer.start().sub;
    });
  }

  private findProjectShouldObserve(projects: Project[]) {
    return projects.filter(project => project.getProjectSetting().watch);
  }
}
