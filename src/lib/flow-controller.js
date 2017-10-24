import { exec } from 'child_process';
import { EventEmitter } from 'events';
import R from 'ramda';
import logger from '../util/logger';

export default class FlowController {
  projectConfig = null;

  static init(flows, repoPath) {
    return new FlowController(flows, repoPath);
  }

  // constructor(projectConfig, eventEmitter, buildReport) {
  //   // TODO 这又弄个 configure 对象干屌
  //   this.updateProjectConfig(projectConfig);
  //   this.eventEmitter = eventEmitter;
  //   this.buildReport = buildReport;
  // }

  constructor(flows, repoPath) {
    this.flows = flows;
    this.repoPath = repoPath;
    this.eventEmitter = new EventEmitter();
  }
  // updateProjectConfig(projectConfig) {
  //   this.projectConfig = projectConfig;
  // }

  start() {
    this.eventEmitter.emit('FLOW_START');
    this.next(this.flows);
  }

  stop() {
    // this.isRunning = false;
    //
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
      this.success();
    }

    const flow = R.take(1, flows)[0];

    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);
    logger.info(`run flow: ${flowName} ${flowCommand} ${this.repoPath}`);

    const repoPath = this.repoPath;

    this.eventEmitter.emit('flowUnitStart', flowName);

    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    cprocess.stdout.on('data', data => {
      const text = data
        .toString()
        .replace(/\u0008/g, '')
        .replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('flowUnitMessageUpdate', flowName, {
        type: 'stdout',
        text
      });
      logger.info(text);
    });

    cprocess.stderr.on('data', data => {
      const text = data
        .toString()
        .replace(/\u0008/g, '')
        .replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('flowUnitMessageUpdate', flowName, {
        type: 'stderr',
        text
      });
      logger.info(text);
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
