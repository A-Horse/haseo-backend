import {EventEmitter} from 'events';
import path from 'path';
import fs from 'fs';
import R from 'ramda';
import Observer from './repo-observer';
import FlowController from './flow-controller';
import YAML from 'yamljs';
import ProjectStatus from './project-status';

export default class Project {
  constructor(repoPath, repoName) {
    this.repoPath = repoPath;
    this.repoName = repoName;
    this.
      eventEmitter = new EventEmitter();
    this.setupEventListen();
    this.updateProjectConfig();
    this.repoObserver = new Observer(this.projectConfig, this.eventEmitter);
    this.flowController = new FlowController(this.projectConfig, this.eventEmitter);
    this.projectStatus = new ProjectStatus();
  }

  updateProjectConfig(projectConfig) {
    const heseoConfigFilePath = path.join(this.repoPath, 'haseo.yaml');
    if (!fs.existsSync(heseoConfigFilePath)) {
      throw new Error('Heseo configure file not found!')
    }
    this.projectConfig = {
      repoPath: this.repoPath,
      ...YAML.load(heseoConfigFilePath)
    };
  }

  setupEventListen() {

    this.eventEmitter.on('repoObserverFail', (errorMsg) => {

    });

    this.eventEmitter.on('newCommit', (commid) => {
      this.flowController.start();
    });

    this.eventEmitter.on('flowUnitStart', () => {

    });

    this.eventEmitter.on('flowUnitFailure', (flowName, output) => {

    });

    this.eventEmitter.on('flowUnitSuccess', (flowName, output) => {

    });

    this.eventEmitter.on('flowFinish', () => {

    });
  }
}
