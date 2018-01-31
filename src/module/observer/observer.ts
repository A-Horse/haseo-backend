import * as fs from 'fs';
import * as path from 'path';
import * as Rx from 'rxjs';
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import configure from '../../configure';
import logger from '../../util/logger';
import Project from 'src/module/project/project';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { RepoPuller } from 'src/module/observer/repo-puller';
import { ProjectWithPullResult, PullResult } from 'src/module/observer/observer.module';

export default class Observer {
  repoPath: string;
  timer: any;
  eventEmitter: EventEmitter;
  state = {
    isPulling: false
  };
  complete$ = new Rx.Subject();
  commit$ = new Rx.Subject();

  constructor(private project: Project) {}

  public pollToPullRepo(): Observable<ProjectWithPullResult> {
    const pull$ = this.createPullObservable();
    const pullDelay$ = pull$.delay(configure['DEFAULT_PULL_INTERVAL']);
    return pullDelay$
      .repeat()
      .map((pullResult: PullResult) => ({ pullResult, project: this.project }));
  }

  private createPullObservable(): Observable<PullResult> {
    return Observable.create(observer => {
      const repoPuller = new RepoPuller();
      repoPuller.pullRepo(this.project.repoPath).subscribe(observer);
      return () => {
        repoPuller.clean();
      };
    });
  }
}
