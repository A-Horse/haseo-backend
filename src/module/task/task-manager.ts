import * as R from 'ramda';
import * as Rx from 'rxjs';
import { TaskQueue } from './task-queue';
import { ProjectWithPullResult } from 'src/module/observer/observer.module';
import Project from 'src/module/project/project';
import { FlowController } from 'src/module/flow/flow-controller';
import { OutputUnit } from 'src/module/flow/flow.module';

export default class TaskManager {
  private queue = new TaskQueue();
  private looping = false;

  constructor(private taskEvent$: Rx.Subject<{ type: string; payload: any }>) {}

  public addToQueue(projectWithPullResult: ProjectWithPullResult) {
    this.queue.push(projectWithPullResult);
    if (!this.looping) {
      this.loop();
    }
  }

  // TODO 这里设计成了单线程的了，以后改掉
  private loop() {
    if (!this.queue.length) {
      this.looping = false;
      return;
    }
    this.looping = true;
    const projectWithPullResult = this.queue.shift();

    this.runProjectFlow(projectWithPullResult);

    // projectWithPullResult.project.eventEmitter.once('BUILD_FINISH', () => {
    //   this.queue = this.queue.slice(1);
    //   this.loop();
    // });
    // project.start();
  }

  private runProjectFlow(projectWithPullResult: ProjectWithPullResult) {
    const project: Project = projectWithPullResult.project;
    const flowController = new FlowController(project.setting.flow, {
      repoPath: project.repoPath,
      taskEvent$: this.taskEvent$
    });

    flowController.flowResult$.subscribe(
      (flowOutput: { status: 'SUCCESS' | 'FAILURE'; flow: object; result: OutputUnit[] }) => {
        this.taskEvent$.next({
          type: 'RPOJECT_FLOW_UPDATE',
          payload: {
            projectName: project.name
          }
        });
      },
      () => {},
      () => {}
    );
  }
}
