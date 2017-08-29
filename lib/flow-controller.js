import { exec } from 'child_process';
import R from 'ramda';

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
      return this.eventEmitter.emit('flowSucceess');
    }
    const flow = R.take(1, flows)[0];

    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);
    console.log(flowName, flowCommand);
    const repoPath = this.projectConfig.repoPath;

    this.eventEmitter.emit('flowUnitStart', flowName);

    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    let output = '';
    let stdOutput = '';
    let errorOutput = '';
    cprocess.stdout.on('data', data => {
      output += data.toString().replace(/\u0008/g, '');
      stdOutput += data.toString().replace(/\u0008/g, '');
      // this.eventEmitter.emit('flowUnitMessageUpdate', flowName, {
      //   flowName,
      //   output,
      //   stdOutput,
      //   errorOutput
      // });
    });

    cprocess.stderr.on('data', data => {
      output += data.toString().replace(/\u0008/g, '');
      errorOutput += data.toString().replace(/\u0008/g, '');
      // this.eventEmitter.emit('flowUnitMessageUpdate', flowName, {
      //   flowName,
      //   output,
      //   stdOutput,
      //   errorOutput
      // });
    });

    cprocess.on('close', code => {
      cprocess.kill();
      if (!!code) {
        this.eventEmitter.emit('flowUnitFailure', flowName, {
          flowName,
          output,
          stdOutput,
          errorOutput
        });
        this.stop();
      } else {
        this.eventEmitter.emit('flowUnitSuccess', flowName, {
          flowName,
          output,
          stdOutput,
          errorOutput
        });
        this.next(R.drop(1, flows));
      }
    });
  }
}
