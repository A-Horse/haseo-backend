import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import R from 'ramda';
import Observer from './repo-observer';
import FlowController from './flow-controller';
import YAML from 'yamljs';
import ProjectStatus from './project-status';
import { TaskEventEmitter } from './task-manager';
import gloablEmmiterInstance from './global-emmiter';

export default class Project {
  constructor(repoPath, repoName) {
    this.repoPath = repoPath;
    this.repoName = repoName;
    this.eventEmitter = new EventEmitter();

    this.setupEventListen();
    this.updateProjectConfig();
    this.repoObserver = new Observer(this.projectConfig, this.eventEmitter);
    this.projectStatus = new ProjectStatus();
    this.flowController = new FlowController(
      this.projectConfig,
      this.eventEmitter,
      this.projectStatus
    );
  }

  getInfomartion() {
    return {
      repoName: this.repoName,
      name: this.projectConfig.name,
      flows: this.projectConfig.flow,
      status: this.projectStatus.getStatusObject()
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

  goBattlefield() {
    this.projectStatus.setStatus('isWaitting', true);
    gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    TaskEventEmitter.emit('add', this);
  }

  start() {
    if (this.projectStatus.getStatus('isRunning')) {
      return;
    }
    this.projectStatus.initStatus();
    this.repoObserver.stopObserve();
    this.flowController.start();
  }

  setupEventListen() {
    this.eventEmitter.on('repoObserverFail', errorMsg => {});

    this.eventEmitter.on('newCommit', commitId => {
      this.updateProjectConfig();
      this.goBattlefield();
    });

    this.eventEmitter.on('flowUnitStart', flowName => {
      this.projectStatus.setStatus('currentFlowName', flowName);
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });

    this.eventEmitter.on('flowUnitSuccess', (flowName, output) => {
      this.projectStatus.pushSuccessedFlow(flowName);
      this.projectStatus.pushFlowOutput(output);

      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });

    this.eventEmitter.on('flowUnitFailure', (flowName, output) => {
      this.projectStatus.setStatus('flowErrorName', flowName);
      this.projectStatus.pushFlowOutput(output);

      this.eventEmitter.emit('flowFailure');
      this.eventEmitter.emit('flowFinish');
    });

    this.eventEmitter.on('flowSucceess', () => {
      this.projectStatus.setStatus('isSuccess', true);

      this.eventEmitter.emit('flowFinish');
    });

    this.eventEmitter.on('flowFailure', () => {
      this.projectStatus.setStatus('isSuccess', false);
    });

    this.eventEmitter.on('flowStart', () => {
      this.projectStatus.setStatus('isRunning', true);
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });

    this.eventEmitter.on('flowFinish', () => {
      this.projectStatus.setStatus('isRunning', false);
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });
  }
}
