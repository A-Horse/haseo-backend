import { EventEmitter } from 'events';
import logger from '../util/logger';
import R from 'ramda';

export const TaskEventEmitter = new EventEmitter();

export default class TaskManager {
  queue = [];
  looping = false;

  constructor() {
    TaskEventEmitter.on('add', this.addToWaitRun.bind(this));
  }

  addToWaitRun(projectName, flowController) {
    logger.debug('task manager addProjetToRun', projectName);
    this.queue.push({
      projectName,
      flowController
    });
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
    const item = R.head(this.queue);

    item.flowController.eventEmitter.once('FLOW_FINISH', () => {
      this.queue = this.queue.slice(1);
      this.loop();
    });
    item.flowController.start();
  }
}
