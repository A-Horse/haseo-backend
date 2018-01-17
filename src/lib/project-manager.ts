import * as fs from 'fs';
import * as path from 'path';
import logger from '../util/logger';
import R from 'ramda';

import systemConfig from '../systemConfig';
import * as configure from '../configure';
import Project from './project';

export default class ProjectManager {
  storePath: string;
  projects: any[];

  constructor() {
    this.storePath = systemConfig.repoStoragePath;
    this.init();
  }

  init() {
    logger.debug('project manager init');
    this.projects = this.readProjectConfigs();
  }

  findProjectByName(projectName) {
    return R.find(project => project.getInfomartion().name === projectName)(this.projects);
  }

  readProjectConfigs() {
    logger.debug('project manager readProjectConfigs');
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .filter(p => fs.lstatSync(path.join(this.storePath, p.toString())).isDirectory())
      .filter(p => fs.existsSync(path.join(this.storePath, p.toString(), configure['CONFIGURE_FILE_NAME'])))
      .map(repoName => new Project(path.join(this.storePath, repoName.toString()), repoName));
  }

  startProject(projectName) {
    logger.debug('startProject', projectName);
    const project = this.findProjectByName(projectName);
    project.updateProjectConfig();
    project.addToTaskManager();
  }

  async getProjectDetailByName(projectName) {
    const project = this.findProjectByName(projectName);
    return await project.getDetail();
  }

  async getProjectReport(projectName, reportId) {
    const project = this.findProjectByName(projectName);
    return await project.getReport(reportId);
  }

  getAllProjectInfomation() {
    return this.projects.map(project => project.getInfomartion());
  }
}
