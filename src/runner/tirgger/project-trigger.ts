import { Project } from "../../runner/project/project";
import { Trigger } from "./tigger";
import { TriggeredProject } from "./triggered-project";
import { Subject } from "rxjs";
import { GitTriggerWatcher } from "../trigger-watcher/git/git-trigger-watcher";
import { TriggerWatcher } from "../trigger-watcher/trigger-watcher";
import { TriggerWatcherFactory } from "../trigger-watcher/trigger-watcher-factory";

export interface ProjectTriggerOption {};

export class ProjectTrigger implements Trigger {
  private triggeredProject$ = new Subject<TriggeredProject>();
  private watchers: TriggerWatcher[];

  constructor() {}

  public generateTirgger(projects: Project[]): void {
    this.watchers = projects
      .map((project: Project): TriggerWatcher => {
      return TriggerWatcherFactory.genTriggerWatcher(project);
    });
  }

  public start(): void {
    this.watchers.forEach((watcher: GitTriggerWatcher) => {
      watcher.startWatch().subscribe((triggeredProject: TriggeredProject) => {
        this.triggeredProject$.next(triggeredProject);
      });
    });
  }

  public getTriggerdItem(): Subject<TriggeredProject> {
    return this.triggeredProject$;
  }

  // private filterProjectShouldObserve(projects: Project[]) {
  //   return projects
  //     .filter(project => project.getSetting().toggle === 'GIT' || project.getSetting().toggle === 'SCHEDUE');
  // }
}