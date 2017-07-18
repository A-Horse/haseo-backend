import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import R from 'ramda';

import systemConfig from '../systemConfig';
import Project from './project';

export default class ProjectManager {
  constructor() {
    this.storePath = systemConfig.repoStoragePath;
    this.init();
  }

  init() {
    this.projects = this.readProjectConfigs();
  }

  readProjectConfigs() {
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .filter(p => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .map(
        repoName => new Project(path.join(this.storePath, repoName), repoName)
      );
  }

  getAllProjectInfomation() {
    return this.projects.map(project => project.getInfomartion());
  }
}
