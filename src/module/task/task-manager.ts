import * as R from 'ramda';
import * as Rx from 'rxjs';
import { TaskQueue } from './task-queue';
import { ProjectWithPullResult } from 'src/module/observer/observer.module';
import Project from 'src/module/project/project';
import { FlowController } from 'src/module/flow/flow-controller';
import { OutputUnit } from 'src/module/flow/flow.module';
import { TaskRunner } from 'src/module/task/task-runner';

export class TaskManager {
  private queue: TaskQueue = new TaskQueue();
  private looping = false;
  private running = false;

  constructor(private taskEvent$: Rx.Subject<{ type: string; payload: any }>) {}

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    // flag running false and clean running process
  }

  public addToQueue(projectWithPullResult: ProjectWithPullResult): void {
    this.queue.push(projectWithPullResult);
    this.runQueueTask();
  }

  // single thread here
  private async runQueueTask(): Promise<void> {
    if (!this.running || this.looping) {
      return Promise.resolve();
    }
    if (!this.queue.length) {
      this.looping = false;
      return Promise.resolve();
    }
    this.looping = true;
    const projectWithPullResult: ProjectWithPullResult = this.queue.shift();
    const taskRunner: TaskRunner = new TaskRunner(projectWithPullResult);
    (await taskRunner.run(this.taskEvent$)).subscribe(() => {
      this.runQueueTask();
    });
  }
}
