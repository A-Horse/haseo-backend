import { ProjectWithPullResult } from '../observer/observer.module';

export class TaskQueue {
  private queue: ProjectWithPullResult[] = [];

  get length(): number {
    return this.queue.length;
  }

  public push(projectWithPullResult: ProjectWithPullResult): void {
    this.queue.push(projectWithPullResult);
  }

  public pop(): ProjectWithPullResult {
    return this.queue.pop();
  }

  public shift(): ProjectWithPullResult {
    return this.queue.shift();
  }
}
