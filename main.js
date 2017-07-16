import fs from 'fs';
import path from 'path';
import bluebird from 'bluebird';
import YAML from 'yamljs';

import Observer from './lib/repo-observer';
import DispatcherInstance from './lib/dispatcher';

class Controller {
  constructor() {
    this.dispatcher = DispatcherInstance;
    this.projectConfigs = this.readProjectConfigs(
      systemConfig.projectConfigsPath
    );
    this.observer = new Observer(this.projectConfigs);
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
