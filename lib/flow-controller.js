import { exec } from 'child_process';
import R from 'ramda';
import logger from '../util/logger';

export default class FlowController {
  projectConfig = null;

  constructor(projectConfig, eventEmitter, projectStatus) {
    this.updateProjectConfig(projectConfig);
    this.eventEmitter = eventEmitter;
    this.projectStatus = projectStatus;
  }

  updateProjectConfig(projectConfig) {
    this.projectConfig = projectConfig;
  }

  start() {
    if (this.projectStatus.getStatus('isRunning')) {
      return;
    }
    this.eventEmitter.emit('flowStart');
    this.next(this.projectConfig.flow);
  }

  stop() {
    // this.isRunning = false;
  }

  next(flows) {
    if (!flows.length) {
      this.stop();
      return this.eventEmitter.emit('FLOW_SUCCESS');
    }
    const flow = R.take(1, flows)[0];

    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);
    logger.info('run flow:', flowName, flowCommand);
    const repoPath = this.projectConfig.repoPath;

    this.eventEmitter.emit('flowUnitStart', flowName);

    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    cprocess.stdout.on('data', data => {
      const text = data.toString().replace(/\u0008/g, '').replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('flowUnitMessageUpdate', flowName, {
        type: 'stdout',
        text
      });
      logger.info(text);
    });

    cprocess.stderr.on('data', data => {
      const text = data.toString().replace(/\u0008/g, '').replace(/\[[0-9;]*m/g, '');
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
        this.stop();
      } else {
        this.eventEmitter.emit('FLOW_UNIT_SUCCESS', flowName);
        this.next(R.drop(1, flows));
      }
    });
  }
}
