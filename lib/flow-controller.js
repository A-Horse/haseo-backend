import { exec } from 'child_process';
import R from 'ramda';

export default class FlowController {
  projectConfig = null;
  isRunning = false;

  constructor(projectConfig, eventEmitter) {
    this.updateProjectConfig(projectConfig);
    this.eventEmitter = eventEmitter;
  }

  updateProjectConfig(projectConfig) {
    this.projectConfig = projectConfig;
  }

  start() {
    if (this.isRunning) {
      return;
    }
    this.eventEmitter.emit('flowStart');
    this.isRunning = true;
    this.next(this.projectConfig.flow);
  }

  stop() {
    this.isRunning = false;
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
    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    let output = '';
    let stdOutput = '';
    let errorOutput = '';
    cprocess.stdout.on('data', data => {
      output += data.toString();
      stdOutput += data.toString();
    });

    cprocess.stderr.on('data', data => {
      output += data.toString();
      errorOutput += data.toString();
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
