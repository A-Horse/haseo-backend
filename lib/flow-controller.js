import { exec } from 'child_process';
import R from 'ramda';

export default class FlowController {
  projectConfig = null;

  constructor(projectConfig, eventEmitter) {
    this.updateProjectConfig(projectConfig);
    this.eventEmitter = eventEmitter;
  }

  updateProjectConfig(projectConfig) {
    this.projectConfig = projectConfig;
  }

  start() {
    this.next(this.projectConfig.flow);
  }

  next(flows) {
    if (!flows.length) {
      return this.eventEmitter('flowFinish');
    }
    const flow = R.take(1, flows)[0];
    console.log('flow = ', flow);
    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);
    console.log(flowName, ',', flowCommand);
    const repoPath = this.projectConfig.repoPath;

    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    let output = '';
    cprocess.stdout.on('data', data => {
      output += data.toString();
    });

    cprocess.stderr.on('data', data => {
      output += data.toString();
    });

    cprocess.on('close', code => {
      cprocess.kill();
      if (!!code) {
        this.eventEmitter.emit('flowUnitFailure', flowName, output);
      } else {
        this.eventEmitter.emit('flowUnitSuccess', flowName, output);
        this.next(R.drop(1, flows));
      }
    });
    // exec(`flow`)
  }
}
