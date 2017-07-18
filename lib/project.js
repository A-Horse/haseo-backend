import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import R from 'ramda';
import Observer from './repo-observer';
import FlowController from './flow-controller';
import YAML from 'yamljs';
import ProjectStatus from './project-status';
import gloablEmmiterInstance from './global-emmiter';

export default class Project {
  constructor(repoPath, repoName) {
    this.repoPath = repoPath;
    this.repoName = repoName;
    this.eventEmitter = new EventEmitter();

    this.setupEventListen();
    this.updateProjectConfig();
    this.repoObserver = new Observer(this.projectConfig, this.eventEmitter);
    this.flowController = new FlowController(
      this.projectConfig,
      this.eventEmitter
    );
    this.projectStatus = new ProjectStatus();
  }

  getInfomartion() {
    return {
      repoName: this.repoName,
      name: this.repoName,
      flows: this.projectConfig.flow,
      status: this.projectStatus.toStatusObject()
    };
  }

  updateProjectConfig() {
    const heseoConfigFilePath = path.join(this.repoPath, 'haseo.yaml');
    if (!fs.existsSync(heseoConfigFilePath)) {
      throw new Error('Heseo configure file not found!');
    }
    this.projectConfig = {
      repoPath: this.repoPath,
      ...YAML.load(heseoConfigFilePath)
    };
  }

  setupEventListen() {
    this.eventEmitter.on('repoObserverFail', errorMsg => {});

    this.eventEmitter.on('newCommit', commitId => {
      this.flowController.start();

      this.projectStatus.initStatus();
    });

    this.eventEmitter.on('flowUnitStart', (flowName) => {
      this.projectStatus.setStatus('currentFlowName', flowName);
    });

    this.eventEmitter.on('flowUnitSuccess', (flowName, output) => {
      this.projectStatus.appendOutput(output);
    });

    this.eventEmitter.on('flowUnitFailure', (flowName, output) => {
      this.projectStatus.setStatus('errorOutput', output);
      this.projectStatus.setStatus('flowErrorName', flowName);
      this.projectStatus.appendOutput(output);

      this.eventEmitter.emit('flowFailure');
      this.eventEmitter.emit('flowFinish');
    });

    this.eventEmitter.on('flowSucceess', () => {
      this.projectStatus.setStatus('isRunning', false);
      this.projectStatus.setStatus('isSuccess', true);
    });

    this.eventEmitter.on('flowFailure', () => {
      this.projectStatus.setStatus('isRunning', false);
      this.projectStatus.setStatus('isSuccess', false);
    });

    this.eventEmitter.on('flowFinish', () => {

    });
  }
}
