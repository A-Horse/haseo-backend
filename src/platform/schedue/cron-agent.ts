import * as cron from 'cron';
import { Project } from '../project/project';
import * as Rx from 'rxjs';
import { ProjectWithMeta } from '../project/project.type';

const CronJob = cron.CronJob;

export class CronAgent {
  constructor(private project: Project) {}

  public runCron(): Rx.Observable<ProjectWithMeta> {
    return Rx.Observable.create((observer: Rx.Observer<ProjectWithMeta>) => {
      const job = new CronJob(this.project.getSetting().schedue, () => {
        observer.next({version: {} as any, project: this.project}) // TODO 额外搞一个 commit_hash 吧
      }, null, true);
      return () => {
        job.stop();
      };
    });
  } 

}