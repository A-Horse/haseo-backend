import fs from 'fs';
import path from 'path';
import bluebird from 'bluebird';
import YAML from 'yamljs';
import systemConfig from './systemConfig';
import R from 'ramda';

import Observer from './lib/repo-observer';
import DispatcherInstance from './lib/dispatcher';
import ProjectManager from './lib/project-manager';

class Controller {
  constructor() {
    this.projectManager = new ProjectManager();
  }

  startup() {}

  restart() {}
}

const ctrl = new Controller();
