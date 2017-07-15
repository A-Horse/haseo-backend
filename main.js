import fs from 'fs';
import path from 'path';
import bluebird from 'bluebird';
import YAML from 'yamljs';

import Observer from './lib/repo-observer';
import DispatcherInstance from './lib/dispatcher';

const systemConfig = {
  repoStoragePath: '/Users/chchen/CI-Storage',
  projectConfigsPath: '/Users/chchen/CI-Haseo/project-yaml',
  repoObserverInterval: 10 * 1000
};

class Controller {
  constructor() {
    this.dispatcher = DispatcherInstance;
    this.projectConfigs = this.readProjectConfigs(
      systemConfig.projectConfigsPath
    );
    this.observer = new Observer(systemConfig, this.projectConfigs);
  }

  readProjectConfigs(storePath) {
    return fs
      .readdirSync(storePath, 'utf-8')
      .filter(p => /.yaml$/.test(p))
      .map(configFilePath => {
        return YAML.load(path.join(storePath, configFilePath));
      });
  }

  startup() {}
}

const ctrl = new Controller();
ctrl.startup();
