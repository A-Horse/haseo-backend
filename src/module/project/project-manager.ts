import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import { pipelineLogger } from '../../util/logger';
import configure from '../../configure';
import Project from './project';

export default class ProjectManager {
  storePath: string;
  projects: any[];

  constructor() {
    this.storePath = path.join(__dirname, '../../../', configure['REPO_STORAGE_PATH']);
    this.init();
  }

  private init() {
    pipelineLogger.debug('project manager init');
    this.projects = this.readProjectConfigs();
  }

  public findProjectByName(projectName: string): Project {
    return R.find(project => project.getInfomartion().name === projectName)(this.projects);
  }

  readProjectConfigs() {
    pipelineLogger.debug('project manager readProjectConfigs');
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .map(repoName => repoName.toString())
      .filter(p => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .filter(p => fs.existsSync(path.join(this.storePath, p, configure['CONFIGURE_FILE_NAME'])))
      .map(repoName => new Project(path.join(this.storePath, repoName), repoName));
  }

  public startProject(projectName) {
    pipelineLogger.debug('startProject', projectName);
    const project = this.findProjectByName(projectName);
    project.updateProjectConfig();
    project.addToTaskManager();
  }

  public async getProjectInfomationByName(projectName): Promise<ProjectInfomation> {
    const project: Project = this.findProjectByName(projectName);
    return await project.getInfomartion();
  }

  public async getProjectReport(projectName, reportId) {
    const project = this.findProjectByName(projectName);
    if (!project) return Promise.resolve(null);
    return await project.getReport(reportId);
  }

  public getAllProjectInfomation() {
    return this.projects.map(project => project.getInfomartion());
  }
}
