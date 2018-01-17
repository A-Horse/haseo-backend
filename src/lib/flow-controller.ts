import * as R from 'ramda';
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import logger from '../util/logger';

export default class FlowController {
  projectConfig = null;
  flows: any[];
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

  start() {
    this.eventEmitter.emit('FLOW_START');
    this.next(this.flows);
  }

  kill() {
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

  next(flows) {
    if (!flows.length) {
      return this.success();
    }

    const flow = R.take(1, flows)[0];

    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);
    logger.info(`run flow: ${flowName} ${flowCommand} ${this.repoPath}`);

    const repoPath = this.repoPath;

    this.eventEmitter.emit('FLOW_UNIT_START', flowName);

    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    cprocess.stdout.on('data', data => {
      const text = data
        .toString()
        .replace(/\u0008/g, '')
        .replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('FLOW_UNIT_MESSAGE_UPDATE', flowName, {
        type: 'stdout',
        text
      });
      logger.info(text);
      this.options.stdout && process.stdout.write(text);
    });

    cprocess.stderr.on('data', data => {
      const text = data
        .toString()
        .replace(/\u0008/g, '')
        .replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('FLOW_UNIT_MESSAGE_UPDATE', flowName, {
        type: 'stderr',
        text
      });
      logger.info(text);
      this.options.stdout && process.stdout.write(text);
    });

    cprocess.on('close', code => {
      cprocess.kill();
      if (!!code) {
        this.eventEmitter.emit('FLOW_UNIT_FAILURE', flowName);
        this.failure();
      } else {
        this.eventEmitter.emit('FLOW_UNIT_SUCCESS', flowName);
        this.next(R.drop(1, flows));
      }
    });
  }
}
