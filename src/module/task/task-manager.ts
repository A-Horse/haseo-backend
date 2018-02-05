import * as R from 'ramda';
import * as Rx from 'rxjs';
import { TaskQueue } from './task-queue';
import { FlowController } from 'src/module/flow/flow-controller';
import { OutputUnit } from 'src/module/flow/flow.module';
import { TaskRunner } from 'src/module/task/task-runner';
import { ProjectWithMeta } from 'src/module/project/product.module';

export class TaskManager {
  private queue: TaskQueue = new TaskQueue();
  private looping = false;
  private running = false;

  constructor(private taskEvent$: Rx.Subject<{ type: string; payload: any }>) {}

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    // TODO flag running false and clean running process
  }

  public addToQueue(projectWithMeta: ProjectWithMeta): void {
    this.queue.push(projectWithMeta);
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
    const projectWithMeta: ProjectWithMeta = this.queue.shift();
    const taskRunner: TaskRunner = new TaskRunner(projectWithMeta);
    (await taskRunner.run(this.taskEvent$)).subscribe(() => {
      this.runQueueTask();
    });
  }
}
