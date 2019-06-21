import { ProjecTask } from "./project-task";

export class TaskQueue {
  private queue: ProjecTask[] = [];

  get length(): number {
    return this.queue.length;
  }

  public push(projectTask: ProjecTask): void {
    this.queue.push(projectTask);
  }

  public pop(): ProjecTask {
    return this.queue.pop();
  }

  public shift(): ProjecTask {
    return this.queue.shift();
  }
}
