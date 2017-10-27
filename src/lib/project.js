import { EventEmitter } from 'events';
import YAML from 'yamljs';
import path from 'path';
import logger from '../util/logger';
import Observer from './repo-observer';
import ProjectDbHelper from './project-db-helper';
import FlowController from './flow-controller';
import ProjectReport from './project-build-report';
import { TaskEventEmitter } from './task-manager';
import gloablEmmiterInstance from './global-emmiter';

export default class Project {
  projectConfig = {};
  state = {};

  constructor(repoPath, repoName, options = {}) {
    this.repoPath = repoPath;
    this.repoName = repoName;
    this.options = options;
    this.projectConfig = this.getProjectConfig();
    this.eventEmitter = new EventEmitter();
    this.buildReport = new ProjectReport();

    if (!this.options.isStandlone) {
      this.repoObserver = new Observer(this.repoPath);
      this.setupObserveEventListen();
    }

    this.projectDbHelper = new ProjectDbHelper(this);

    this.addToTaskManager();
  }

  getInfomartion() {
    return {
      repoName: this.repoName,
      name: this.projectConfig.name,
      flows: this.projectConfig.flow,
      status: this.buildReport.getObject()
    };
  }

  pullFromRemote() {
    this.repoObserver.poll();
  }

  getProjectConfig() {
    logger.info(`project get project configure ${this.repoName}`);
    const heseoConfigFilePath = path.join(this.repoPath, 'haseo.yaml');
    return {
      repoPath: this.repoPath,
      ...YAML.load(heseoConfigFilePath)
    };
  }

  updateProjectConfig() {
    logger.info(`project update project configure ${this.repoName}`);
    this.projectConfig = this.getProjectConfig();
  }

  addToTaskManager() {
    logger.info(`projet addToTaskManagering ${this.repoName}`);

    if (this.state.isWaitting) {
      // TODO 这里应该重设一下
      logger.info('projet addToTaskManager break becasue it is waitting', this.repoName);
      return;
    }

    this.state.isWaitting = true;

    gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    TaskEventEmitter.emit('add', this);
  }

  start() {
    logger.debug('project starting', this.repoName);

    this.buildReport.initStatus();
    const flowController = FlowController.init(this.projectConfig.flow, this.repoPath, {
      stdout: this.options.isStandlone
    });
    this.listenFlowEvent(flowController);
    flowController.start();

    !this.options.isStandlone && this.repoObserver.stopObserve();
  }

  listenFlowEvent(flowController) {
    flowController.eventEmitter.on('FLOW_UNIT_START', flowName => {
      this.buildReport.set('currentFlowName', flowName);
      gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_UNIT_SUCCESS', flowName => {
      this.buildReport.pushSuccessedFlow(flowName);
      gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_UNIT_FAILURE', flowName => {
      this.buildReport.set('flowErrorName', flowName);
    });

    flowController.eventEmitter.on('FLOW_SUCCESS', () => {
      this.buildReport.set('isSuccess', true);
    });

    flowController.eventEmitter.on('FLOW_FAILURE', () => {
      this.buildReport.set('isSuccess', false);
    });

    flowController.eventEmitter.on('FLOW_UNIT_MESSAGE_UPDATE', (flowName, fragment) => {
      gloablEmmiterInstance.emit('PROJECT_UNIT_FRAGMENT_UPDATE', {
        name: this.projectConfig.name,
        flowName,
        fragment
      });
      this.buildReport.pushFlowOutput(flowName, fragment);
    });

    flowController.eventEmitter.on('FLOW_START', () => {
      this.state.isRunning = true;
      this.buildReport.set('startDate', new Date());
      gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_FINISH', () => {
      // TODO report 和状态分开
      this.state.isRunning = false;
      this.state.isWaitting = false;
      this.eventEmitter.emit('BUILD_FINISH');
      gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());

      !this.options.isStandlone && this.projectDbHelper.saveBuildReport(this);
      !this.options.isStandlone && this.repoObserver.startObserve();
    });
  }

  // TODO 只能在这里监听，不能在其他地方监听，其他地方需要的话在这里调用
  setupObserveEventListen() {
    this.repoObserver.eventEmitter.on('OBSERVE_ERROR', () => {});

    this.repoObserver.eventEmitter.on('OBSERVE_NEW_COMMIT', commitId => {
      logger.info('receive observable new commit in project', this.repoName);
      this.updateProjectConfig();
      this.addToTaskManager();
    });
  }
}
