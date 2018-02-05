import * as R from 'ramda';
import * as Rx from 'rxjs';
import { TaskQueue } from './task-queue';
import { FlowController } from 'src/module/flow/flow-controller';
import { OutputUnit } from 'src/module/flow/flow.module';
import { TaskRunner } from 'src/module/task/task-runner';
import { ProjectWithMeta } from 'src/module/project/project.module';

export class TaskManager {
  private queue: TaskQueue = new TaskQueue();
  private taskEvent$ = new Rx.Subject<{ type: string; payload: any }>();
  private looping = false;
  private running = false;

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
  private runQueueTask(): void {
    if (!this.running || this.looping) {
      return;
    }
    if (!this.queue.length) {
      this.looping = false;
      return;
    }
    this.looping = true;
    this.runProjectTask();
  }

  private async runProjectTask(): Promise<void> {
    const projectWithMeta: ProjectWithMeta = this.queue.shift();
    const taskRunner: TaskRunner = new TaskRunner(projectWithMeta, this.taskEvent$);
    const taskRunComplete$ = await taskRunner.run();

    taskRunComplete$.subscribe(() => {
      this.runQueueTask();
    });
  }
}
