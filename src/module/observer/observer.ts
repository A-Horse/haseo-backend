import * as fs from 'fs';
import * as path from 'path';
import * as Rx from 'rxjs';
import configure from '../../configure';
import { Project } from 'src/module/project/project';
import { RepoPuller } from 'src/module/observer/repo-puller';
import { ProjectWithMeta, PullResult } from 'src/module/observer/observer.module';

export class Observer {
  private polling: boolean = false;
  constructor(private project: Project) {}

  public pollToPullRepo(): Rx.Observable<ProjectWithMeta> {
    if (this.polling) {
      throw new Error('Observer already polling');
    }
    const pull$ = this.createPullObservable();
    const pullDelay$ = pull$.delay(configure['DEFAULT_PULL_INTERVAL']);
    const poll$ = pullDelay$
      .repeat()
      .map((version: PullResult) => ({ version, project: this.project }))
      .share();

    this.polling = true;
    poll$.subscribe(null, null, () => (this.polling = false));

    return poll$;
  }

  public getObserveProject(): Project {
    return this.project;
  }

  private createPullObservable(): Rx.Observable<PullResult> {
    return Rx.Observable.create(observer => {
      const repoPuller = new RepoPuller();
      repoPuller.pullRepo(this.project.repoPath).subscribe(observer);
      return () => {
        repoPuller.clean();
      };
    });
  }
}
