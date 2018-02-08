import * as R from 'ramda';
import { TaskRunner } from '../task/task-runner';

export class TaskRunContainer {
  private taskRunners: TaskRunner[] = [];

  public add(taskRunner: TaskRunner): void {
    this.taskRunners.push(taskRunner);
    taskRunner.complete$.subscribe(() => {
      this.remove(taskRunner);
    });
    taskRunner.run();
  }

  public remove(taskRunner: TaskRunner): void {
    const i = R.findIndex(tr => tr === taskRunner);
    R.remove(i, this.taskRunners);
  }

  public findTaskRunnerByReportId(repportId: number): TaskRunner {
    return R.find((taskRunner: TaskRunner) => {
      return taskRunner.reportId === repportId;
    })[this.taskRunners];
  }
}
