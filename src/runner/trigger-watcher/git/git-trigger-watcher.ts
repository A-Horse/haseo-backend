import { Observable } from 'rxjs';
import { delay, repeat, map, retryWhen, tap } from 'rxjs/operators';
import { RepoPuller, RepoVersion } from './repo-puller';
import { TriggerWatcher } from '../trigger-watcher';
import { Project } from '../../../runner/project/project';
import configure from '../../../configure';
import { TriggeredProject, TriggerType } from '../../tirgger/triggered-project';

export class GitTriggerWatcher implements TriggerWatcher {
  private polling: boolean = false;
  readonly type = TriggerType.GIT;

  constructor(private project: Project) {}

  public startWatch(): Observable<TriggeredProject> {
    if (this.polling) {
      throw new Error(`GitTriggerWatcher [Project=${this.project.name}] already polling`);
    }
    const pull$ = this.createPullObservable();
    const pullDelay$ = pull$.pipe(delay(configure['DEFAULT_PULL_INTERVAL']));

    const poll$ = pullDelay$
      .pipe(
        tap(() => {
          this.polling = true;
        }),
        repeat(),
        map((version: RepoVersion) => new TriggeredProject(this.project, this.type,  {
          output: version.output,
          gitCommits: [version.commitHash],
        })),
        retryWhen(errors => errors.pipe(delay(1000))),
        tap({
          complete() {
            this.polling = false;
          }
        })
      );

    // this.polling = true;
    // poll$.subscribe(null, console.error, () => (this.polling = false));

    return poll$;
  }

  // public pollToPullRepo(): Observable<ProjectWithMeta> {
  //   if (this.polling) {
  //     throw new Error('Observer already polling');
  //   }
  //   const pull$ = this.createPullObservable();
  //   const pullDelay$ = pull$.delay(configure['DEFAULT_PULL_INTERVAL']);
  //   const poll$ = pullDelay$
  //     .repeat()
  //     .map((version: RepoVersion) => ({ version, project: this.project }))
  //     .retryWhen(errors => errors.delay(1000))
  //     .share();

  //   this.polling = true;
  //   poll$.subscribe(null, console.error, () => (this.polling = false));

  //   return poll$;
  // }

  public getProject(): Project {
    return this.project;
  }

  private createPullObservable(): Observable<RepoVersion> {
    return Observable.create(observer => {
      const repoPuller = new RepoPuller();
      repoPuller.pullRepo(this.project.repoPath).subscribe(observer);
      return () => {
        repoPuller.clean();
      };
    });
  }
}
