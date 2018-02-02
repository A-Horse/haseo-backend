import * as R from 'ramda';
import { TaskQueue } from './task-queue';
import { ProjectWithPullResult } from 'src/module/observer/observer.module';
import Project from 'src/module/project/project';
import FlowController from 'src/module/project/flow-controller';

export default class TaskManager {
  private queue = new TaskQueue();
  private looping = false;

  public addToQueue(projectWithPullResult: ProjectWithPullResult) {
    this.queue.push(projectWithPullResult);
    if (!this.looping) {
      this.loop();
    }
  }

  // TODO 这里设计成了单线程的了，以后改掉
  private loop() {
    if (!this.queue.length) {
      this.looping = false;
      return;
    }
    this.looping = true;
    const projectWithPullResult = this.queue.shift();

    this.runProjectFlow(projectWithPullResult);

    // projectWithPullResult.project.eventEmitter.once('BUILD_FINISH', () => {
    //   this.queue = this.queue.slice(1);
    //   this.loop();
    // });
    // project.start();
  }

  private runProjectFlow(projectWithPullResult: ProjectWithPullResult) {
    const project: Project = projectWithPullResult.project;
    new FlowController();
  }
}
