import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import logger from '../util/logger';
import R from 'ramda';

import systemConfig from '../systemConfig';
import Project from './project';
import { ConfigureFileName } from '../constants';

export default class ProjectManager {
  constructor() {
    this.storePath = systemConfig.repoStoragePath;
    this.init();
  }

  init() {
    logger.debug('project manager init');
    this.projects = this.readProjectConfigs();
  }

  readProjectConfigs() {
    logger.debug('project manager readProjectConfigs');
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .filter(p => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .filter(p => fs.existsSync(path.join(this.storePath, p, ConfigureFileName)))
      .map(repoName => new Project(path.join(this.storePath, repoName), repoName));
  }

  startProject(projectName) {
    logger.debug('startProject', projectName);
    const project = R.find(project => project.getInfomartion().name === projectName)(this.projects);
    project.updateProjectConfig();
    // project.pullFromRemote();
    project.goBattlefield();
  }

  getAllProjectInfomation() {
    return this.projects.map(project => project.getInfomartion());
  }
}