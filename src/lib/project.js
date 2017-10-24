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

  constructor(repoPath, repoName, isStandlone, options = {}) {
    this.repoPath = repoPath;
    this.repoName = repoName;
    this.isStandlone = isStandlone;
    this.eventEmitter = new EventEmitter();
    this.projectStatus = new ProjectStatus();
    this.setupEventListen();
    if (!isStandlone) {
      this.repoObserver = new Observer(this.repoPath, this.eventEmitter);
    }
    this.projectConfig = this.updateProjectConfig();
    this.flowController = new FlowController(
      this.projectConfig,
      this.eventEmitter,
      this.projectStatus
    );
    this.goBattlefield();
  }

  async saveBuildReport() {
    try {
      await knex('project_build_report').insert({
        project_name: this.projectConfig.name,
        start_date: this.projectStatus.get('startDate'),
        status_serialization: JSON.stringify(this.projectStatus.getStatus())
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
      status: this.projectStatus.getObject()
    };
  }

  pullFromRemote() {
    this.repoObserver.poll();
  }

  updateProjectConfig() {
    logger.debug('project update project configure', this.repoName);
    const heseoConfigFilePath = path.join(this.repoPath, 'haseo.yaml');
    return {
      repoPath: this.repoPath,
      ...YAML.load(heseoConfigFilePath)
    };
  }

  goBattlefield() {
    logger.debug('projet goBattlefielding', this.repoName);
    if (this.projectStatus.get('isWaitting')) {
      // TODO 这里应该重设一下
      logger.debug('projet goBattlefield break becasue it is waitting', this.repoName);
      return;
    }
    this.projectStatus.set('isWaitting', true);
    gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    TaskEventEmitter.emit('add', this);
  }

  start() {
    logger.debug('project starting', this.repoName);
    if (this.projectStatus.get('isRunning')) {
      logger.debug('project starting break becasue it is isRunning', this.repoName);
      return;
    }
    this.projectStatus.initStatus();
    !this.isStandlone && this.repoObserver.stopObserve();
    this.flowController.start();
  }

  // TODO 只能在这里监听，不能在其他地方监听，其他地方需要的话在这里调用
  setupEventListen() {
    this.eventEmitter.on('repoObserverFail', errorMsg => {
      logger.info('repoObserverFail');
    });

    this.eventEmitter.on('newCommit', commitId => {
      logger.debug('receive observable new commit in project', this.repoName);
      this.projectConfig = this.updateProjectConfig();
      this.flowController.updateProjectConfig(this.projectConfig);
      this.goBattlefield();
    });

    this.eventEmitter.on('flowUnitStart', flowName => {
      this.projectStatus.set('currentFlowName', flowName);
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });

    this.eventEmitter.on('FLOW_UNIT_SUCCESS', flowName => {
      this.projectStatus.pushSuccessedFlow(flowName);
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });

    this.eventEmitter.on('FLOW_UNIT_FAILURE', flowName => {
      this.projectStatus.set('flowErrorName', flowName);

      this.eventEmitter.emit('flowFailure');
      this.eventEmitter.emit('flowFinish');
    });

    this.eventEmitter.on('FLOW_SUCCESS', () => {
      this.projectStatus.set('isSuccess', true);
      this.eventEmitter.emit('flowFinish');
    });

    this.eventEmitter.on('flowFailure', () => {
      this.projectStatus.set('isSuccess', false);
    });

    this.eventEmitter.on('flowUnitMessageUpdate', (flowName, fragment) => {
      gloablEmmiterInstance.emit('PROJECT_UNIT_FRAGMENT_UPDATE', {
        name: this.projectConfig.name,
        flowName,
        fragment
      });
      this.projectStatus.pushFlowOutput(flowName, fragment);
    });

    this.eventEmitter.on('flowStart', () => {
      this.projectStatus.set('isRunning', true);
      this.projectStatus.set('startDate', new Date());
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });

    this.eventEmitter.on('flowFinish', () => {
      this.projectStatus.set('isRunning', false);
      !this.isStandlone && this.saveBuildReport();
      gloablEmmiterInstance.emit('projectStatusUpdate', this.getInfomartion());
    });
  }
}
