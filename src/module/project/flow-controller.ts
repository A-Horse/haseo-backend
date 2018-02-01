import * as R from 'ramda';
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import logger from '../../util/logger';

// TODO 应该改名为 builController
export default class FlowController {
  projectConfig = null;
  private flows: any[];
  repoPath: string;
  options: any;
  eventEmitter: EventEmitter;

  static init(flows, repoPath, options = {}) {
    return new FlowController(flows, repoPath, options);
  }

  constructor(flows, repoPath, options) {
    this.flows = flows;
    this.repoPath = repoPath;
    this.options = options;
    this.eventEmitter = new EventEmitter();
  }

  public start() {
    this.eventEmitter.emit('FLOW_START');
    this.next(this.flows);
  }

  public kill() {
    this.eventEmitter.removeAllListeners();
    this.eventEmitter = null;
  }

  failure() {
    this.eventEmitter.emit('FLOW_FAILURE');
    this.finish();
  }

  finish() {
    this.eventEmitter.emit('FLOW_FINISH');
    this.kill();
  }

  success() {
    this.eventEmitter.emit('FLOW_SUCCESS');
    this.finish();
  }

  private next(flows) {
    if (!flows.length) {
      return this.success();
    }

    const flow = R.take(1, flows)[0];
  }
}
