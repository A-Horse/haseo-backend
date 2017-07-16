import {EventEmitter} from 'events';
import Observer from './repo-observer';
import FlowController from './flow-controller';

export default class Project {
  constructor(projectConfig) {
    this.updateProjectConfig(projectConfig);
    this.
      eventEmitter = new EventEmitter();
    this.repoObserver = new Observer(projectConfig.git, this.eventEmitter);
    this.flowController = new FlowController(projectConfig);
    this.setupEventListen();
  }

  updateProjectConfig(projectConfig) {
    this.projectConfig = projectConfig;
  }

  setupEventListen() {
    this.eventEmitter.on('repoObserverFail', () => {

    });

    this.eventEmitter.on('newCommit', () => {

    });

    this.eventEmitter.on('flowUnitStart', () => {

    })
  }


}
