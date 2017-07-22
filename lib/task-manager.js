import { EventEmitter } from 'events';
import R from 'ramda';

export const TaskEventEmitter = new EventEmitter();

export default class TaskManager {
  queue = [];
  looping = false;
  constructor() {
    TaskEventEmitter.on('add', project => {
      this.addProjetToRun(project);
    });
  }

  addProjetToRun(project) {
    this.queue.push(project);
    if (!this.looping) {
      this.loop();
    }
  }

  loop() {
    if (!this.queue.length) {
      this.looping = false;
      return;
    }
    this.looping = true;
    const project = this.queue[0];
    project.eventEmitter.once('flowFinish', () => {
      this.queue = this.queue.slice(1);
      this.loop();
    });
    project.start();
  }
}
