import * as Rx from 'rxjs';
import { TaskQueue } from './task-run-queue';
import { TaskRunner } from '../task/task-runner';
import { Project } from '../project/project';
import { ProjecTask } from './project-task';
import { TaskRunContainer } from './task-run-container';
import { RunnerContext } from '../context/runner-context';
import * as assert from 'assert';

export class TaskManager {
  private queue: TaskQueue = new TaskQueue();
  private runContainer = new TaskRunContainer();
  // private taskEvent$ = new Rx.Subject<FSAction>();
  private looping = false;
  private running = false;

  constructor(private runnerContext: RunnerContext) {
    assert(runnerContext instanceof RunnerContext);
  }

  public start(): void {
    this.running = true;
    this.runQueueTask();
  }

  public stop(): void {
    this.running = false;
  }

  public registerProjectTask(project: Project): void {
    this.queue.push(new ProjecTask(project));
    this.runQueueTask();
  }

  // public queryProjectTaskOutput(reportId: number, offset: number): FlowOutputUnit[] {
  //   const taskRunner: TaskRunner = this.runContainer.findTaskRunnerByReportId(reportId);
  //   if (!taskRunner) {
  //     return null;
  //   }
  //   return taskRunner.queryRunOutputPart(offset);
  // }

  // public getTaskEvent$(): Rx.Subject<FSAction> {
  //   return this.taskEvent$;
  // }

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
    const projectTask: ProjecTask = this.queue.shift();
    const taskRunner: TaskRunner = new TaskRunner(projectTask, this.runnerContext);

    this.runContainer.run(taskRunner);

    taskRunner.complete$.subscribe(() => {
      this.looping = false;
      this.runQueueTask();
    });
  }
}
