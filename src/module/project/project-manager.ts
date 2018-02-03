import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import configure from '../../configure';
import Project from 'src/module/project/project';

export default class ProjectManager {
  public projects: Project[];
  private storePath: string = path.join(__dirname, '../../../', configure['REPO_STORAGE_PATH']);

  constructor() {
    this.projects = this.getProjectFromDirConfigs();
  }

  public getProjects(): Project[] {
    return this.projects;
  }

  public findProjectByName(projectName: string): Project {
    return R.find((project: Project) => project.getInfomartion().name === projectName)(
      this.projects
    );
  }

  public startProject(projectName) {
    const project = this.findProjectByName(projectName);
    project.updateProjectConfig();
    project.addToTaskManager();
  }

  public async getProjectInfomationByName(projectName): Promise<ProjectInfomation> {
    const project: Project = this.findProjectByName(projectName);
    return await project.getInfomartion();
  }

  public async getProjectReport(projectName, reportId): Promise<any> {
    const project = this.findProjectByName(projectName);
    if (!project) {
      return Promise.resolve(null);
    }
    return await project.getReport(reportId);
  }

  public getAllProjectInfomation() {
    return this.projects.map(project => project.getInfomartion());
  }

  public startObserable(): void {}

  private getProjectFromDirConfigs(): Project[] {
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .map(repoName => repoName.toString())
      .filter(p => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .filter(p => fs.existsSync(path.join(this.storePath, p, configure['CONFIGURE_FILE_NAME'])))
      .map(repoName => new Project(path.join(this.storePath, repoName), repoName));
  }
}
