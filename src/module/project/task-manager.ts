import * as R from 'ramda';
import { EventEmitter } from 'events';
import logger from '../../util/logger';

export const TaskEventEmitter = new EventEmitter();

export default class TaskManager {
  queue = [];
  looping = false;

  constructor() {
    TaskEventEmitter.on('add', this.addToWaitRun.bind(this));
  }

  addToWaitRun(project) {
    logger.debug('task manager addProjetToRun', project.projectConfig.name);
    this.queue.push(project);
    if (!this.looping) {
      this.loop();
    }
  }

  // TODO 这里设计成了单线程的了，以后改掉
  loop() {
    logger.debug('task manager loop');
    if (!this.queue.length) {
      this.looping = false;
      return;
    }
    this.looping = true;
    const project = R.head(this.queue);

    project.eventEmitter.once('BUILD_FINISH', () => {
      this.queue = this.queue.slice(1);
      this.loop();
    });
    project.start();
  }
}
