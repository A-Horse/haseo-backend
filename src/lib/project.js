import { EventEmitter } from 'events';
import path from 'path';
import logger from '../util/logger';
import Observer from './repo-observer';
import FlowController from './flow-controller';
import YAML from 'yamljs';
import ProjectStatus from './project-status';
import { TaskEventEmitter } from './task-manager';
import gloablEmmiterInstance from './global-emmiter';
import knex from '../service/knex';

export default class Project {
  projectConfig = {};
  state = {};

  constructor(repoPath, repoName, options = {}) {
    this.repoPath = repoPath;
    this.repoName = repoName;
    this.options = options;
    this.projectConfig = this.getProjectConfig();
    this.eventEmitter = new EventEmitter();
    this.buildReport = new ProjectStatus();

    if (!this.options.isStandlone) {
      this.repoObserver = new Observer(this.repoPath, this.eventEmitter);
    }

    this.setupObserveEventListen();
    this.flowController = new FlowController(
      this.projectConfig,
      this.eventEmitter,
      this.buildReport
    );

    this.addToTaskManager();
  }

  async saveBuildReport() {
    try {
      await knex('project_build_report').insert({
        project_name: this.projectConfig.name,
        start_date: this.buildReport.get('startDate'),
        status_serialization: JSON.stringify(this.buildReport.getStatus())
      });
      logger.info(`project build report save successful ${this.projectConfig.name}`);
    } catch (error) {
      logger.error('project build report save error', error);
    }
  }

  async getLastBuildReport() {
    try {
      const report = await knex('project_build_report')
        .select('*')
        .where('project_name', '=', this.projectConfig.name)
        .orderBy('start_date', 'desc')
        .limit(1);
      logger.info(`get project ${this.projectConfig.name} last build report success ${report}`);
    } catch (error) {
      logger.error('', error);
    }
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
    logger.debug('projet addToTaskManagering', this.repoName);

    if (this.state.isWaitting) {
      // TODO 这里应该重设一下
      logger.debug('projet addToTaskManager break becasue it is waitting', this.repoName);
      return;
    }

    this.state.isWaitting = true;
    const flowController = FlowController.init(this.projectConfig.flow, this.repoPath);
    this.listenFlowEvent(flowController);

    gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    TaskEventEmitter.emit('add', this.projectConfig.name, flowController);
  }

  listenFlowEvent(flowController) {
    flowController.eventEmitter.on('flowUnitStart', flowName => {
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

    flowController.eventEmitter.on('flowUnitMessageUpdate', (flowName, fragment) => {
      gloablEmmiterInstance.emit('PROJECT_UNIT_FRAGMENT_UPDATE', {
        name: this.projectConfig.name,
        flowName,
        fragment
      });
      this.buildReport.pushFlowOutput(flowName, fragment);
    });

    flowController.eventEmitter.on('FLOW_START', () => {
      this.buildReport.set('isRunning', true);
      this.buildReport.set('startDate', new Date());
      gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_FINISH', () => {
      this.buildReport.set('isRunning', false);
      this.repoObserver.startObserve();
      !this.options.isStandlone && this.saveBuildReport();
      gloablEmmiterInstance.emit('buildReportUpdate', this.getInfomartion());
    });
  }

  start() {
    logger.debug('project starting', this.repoName);
    if (this.buildReport.get('isRunning')) {
      logger.debug('project starting break becasue it is isRunning', this.repoName);
      return;
    }
    this.buildReport.initStatus();
    !this.options.isStandlone && this.repoObserver.stopObserve();
    this.flowController.start();
  }

  // TODO 只能在这里监听，不能在其他地方监听，其他地方需要的话在这里调用
  setupObserveEventListen() {
    this.repoObserver.eventEmitter.on('OBSERVE_ERROR', () => {});

    this.repoObserver.eventEmitter.on('OBSERVE_NEW_COMMIT', commitId => {
      logger.info('receive observable new commit in project', this.repoName);
      this.updateProjectConfig();
      // this.flowController.updateProjectConfig(this.projectConfig);
      this.addToTaskManager();
    });
  }
}
