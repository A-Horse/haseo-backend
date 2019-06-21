import * as cron from 'cron';
import { TriggerWatcher } from '../trigger-watcher';
import { Observable, Observer } from 'rxjs';
import { TriggeredProject, TriggerType } from '../../tirgger/triggered-project';
import { Project } from '../../../runner/project/project';

const CronJob = cron.CronJob;

export class CronTriggerWatcher implements TriggerWatcher {
  readonly type = TriggerType.SCHEDUE;
  constructor(private project: Project) {}

  public startWatch(): Observable<TriggeredProject> {
    return Observable.create((observer: Observer<TriggeredProject>) => {
      const job = new CronJob(this.project.getSetting().schedue, () => {
        observer.next(new TriggeredProject(this.project, this.type, {
          output: this.generateOutput(),
        }))
      }, null, true);

      return () => {
        job.stop();
      };
    });
  }

  public getProject(): Project {
    return this.project;
  }

  private generateOutput(): string {
    const date = new Date().toString();
    return `cron trigger triggered on ${date}`;
  }

}