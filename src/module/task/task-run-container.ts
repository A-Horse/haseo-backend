import { TaskRunner } from 'src/module/task/task-runner';

export class TaskRunContainer {
  private tasks: TaskRunner[] = [];

  public add(taskRunner: TaskRunner): void {
    this.tasks.push(taskRunner);

    taskRunner.run();
  }

  public;
}
