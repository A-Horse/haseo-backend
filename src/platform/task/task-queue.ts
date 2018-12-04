import { ProjectWithMeta } from '../project/project.type';

export class TaskQueue {
  private queue: ProjectWithMeta[] = [];

  get length(): number {
    return this.queue.length;
  }

  public push(projectWithMeta: ProjectWithMeta): void {
    this.queue.push(projectWithMeta);
  }

  public pop(): ProjectWithMeta {
    return this.queue.pop();
  }

  public shift(): ProjectWithMeta {
    return this.queue.shift();
  }
}
