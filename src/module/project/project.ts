import * as path from 'path';
import * as YAML from 'yamljs';
import * as R from 'ramda';
// import gloablEmmiterInstance from './global-emmiter';
import { ProjectSetting } from 'src/module/project/project.module';

export class Project {
  public name: string;
  private setting: ProjectSetting;

  constructor(public repoPath: string, public repoName: string) {
    this.readProjectSetting();
  }

  public getInfomartion() {
    return {
      name: this.setting.name,
      flows: this.setting.flow
    };
  }

  public getSetting(): ProjectSetting {
    return this.setting;
  }

  public async getReportHistory(offset: number, limit: number): Promise<any[]> {
    return await this.projectDbHelper.getReportHistoryWithoutOutput(offset, limit);
  }

  public async getReport(reportId): Promise<ProjectBuildReport> {
    return await this.projectDbHelper.getReport(reportId);
  }

  public start(): void {
    logger.debug('project starting', this.repoName);

    this.buildReport.initReportData();
    const flowController = FlowController.init(this.setting.flow, this.repoPath, {
      stdout: this.options.watch
    });
    this.listenFlowEvent(flowController);
    flowController.start();

    // TODO
    !this.options.watch && this.repoObserver.stopObserve();
  }

  public updateProjectConfig() {
    logger.info(`project update project configure ${this.repoName}`);
    this.readProjectSetting();
  }

  // TODO 这里应该由外面加进去
  public addToTaskManager(): void {
    logger.info(`projet addToTaskManagering ${this.repoName}`);

    if (this.state.isWaitting) {
      // TODO 这里应该重设一下
      logger.info('projet addToTaskManager break becasue it is waitting', this.repoName);
      return;
    }

    this.state.isWaitting = true;

    gloablEmmiterInstance.emit('PROJECT_BUILD_INFORMATION_UPDATE', this.getInfomartion());
    TaskEventEmitter.emit('add', this);
  }

  private async assignLatestBuildReport(): Promise<void> {
    const reportData: ProjectBuildReportData = await this.projectDbHelper.getLastBuildReportData();
    if (reportData) {
      this.buildReport.replaceReport(reportData);
    }
  }

  private readProjectSetting(): void {
    const heseoConfigFilePath = path.join(this.repoPath, 'haseo.yaml');
    this.setting = YAML.load(heseoConfigFilePath);
    this.name = this.setting.name;
  }

  private listenFlowEvent(flowController) {
    flowController.eventEmitter.on('FLOW_START', () => {
      this.state.isRunning = true;
      this.state.isWaitting = false;
      this.buildReport.set('startDate', new Date().getTime());

      gloablEmmiterInstance.emit('PROJECT_BUILD_INFORMATION_UPDATE', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_UNIT_START', flowName => {
      this.state.currentFlowName = flowName;

      gloablEmmiterInstance.emit('PROJECT_BUILD_INFORMATION_UPDATE', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_UNIT_MESSAGE_UPDATE', (flowName, fragment) => {
      gloablEmmiterInstance.emit('PROJECT_UNIT_FRAGMENT_UPDATE', {
        name: this.setting.name,
        flowName,
        fragment
      });
      this.buildReport.pushFlowOutput(flowName, fragment);
    });

    flowController.eventEmitter.on('FLOW_UNIT_SUCCESS', flowName => {
      // this.buildReport.pushSuccessedFlow(flowName);
      gloablEmmiterInstance.emit('PROJECT_BUILD_INFORMATION_UPDATE', this.getInfomartion());
    });

    flowController.eventEmitter.on('FLOW_UNIT_FAILURE', flowName => {
      this.buildReport.set('flowErrorName', flowName);
    });

    flowController.eventEmitter.on('FLOW_UNIT_FINISH', flowName => {});

    flowController.eventEmitter.on('FLOW_SUCCESS', () => {
      this.buildReport.set('isSuccess', true);
    });

    flowController.eventEmitter.on('FLOW_FAILURE', () => {
      this.buildReport.set('isSuccess', false);
    });
    flowController.eventEmitter.on('FLOW_FINISH', () => {
      // TODO report 和状态分开
      this.state.isRunning = false;
      this.eventEmitter.emit('BUILD_FINISH');
      gloablEmmiterInstance.emit('PROJECT_BUILD_INFORMATION_UPDATE', this.getInfomartion());

      this.projectDbHelper.saveBuildReport();
      this.repoObserver.startObserve();
    });
  }

  // // TODO 只能在这里监听，不能在其他地方监听，其他地方需要的话在这里调用
  // private setupObserveEventListen() {
  //   this.repoObserver.eventEmitter.on('OBSERVE_ERROR', () => {});

  //   this.repoObserver.eventEmitter.on('OBSERVE_NEW_COMMIT', commitId => {
  //     logger.info('receive observable new commit in project', this.repoName);
  //     this.updateProjectConfig();
  //     this.addToTaskManager();
  //   });
  // }
}
