import * as R from 'ramda';
import * as Rx from 'rxjs';
import { TaskQueue } from './task-queue';
import { FlowController } from '../task/flow/flow-controller';
import { TaskRunner } from '../task/task-runner';
import { ProjectWithMeta } from '../project/project.module';
import { TaskRunContainer } from '../task/task-run-container';

export class TaskManager {
  private queue: TaskQueue = new TaskQueue();
  private runContainer = new TaskRunContainer();
  private taskEvent$ = new Rx.Subject<FSAction>();
  private looping = false;
  private running = false;
  private flow$;

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

  public queryTaskRunnerOutputPartByReportId(reportId: number, offset: number): FlowOutputUnit[] {
    const taskRunner: TaskRunner = this.runContainer.findTaskRunnerByReportId(reportId);
    if (!taskRunner) {
      return null;
    }
    return taskRunner.queryRunOutputPart(offset);
  }

  public getTaskEvent$(): Rx.Subject<FSAction> {
    return this.taskEvent$;
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
    console.log(2);
    const projectWithMeta: ProjectWithMeta = this.queue.shift();
    const taskRunner: TaskRunner = new TaskRunner(projectWithMeta, this.taskEvent$);

    this.runContainer.add(taskRunner);

    taskRunner.complete$.subscribe(() => {
      this.looping = false;
      this.runQueueTask();
    });
  }
}
