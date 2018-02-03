import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import configure from '../../configure';
import { Project } from 'src/module/project/project';

export class ProjectManager {
  public projects: Project[];
  private storePath: string = path.join(__dirname, '../../../', configure['REPO_STORAGE_PATH']);

  public initial(): void {
    this.projects = this.generateProjectFromDirConfigs();
  }

  public getProjects(): Project[] {
    return this.projects;
  }

  public getProjectByName(projectName: string): Project {
    return R.find((project: Project) => project.getInfomartion().name === projectName)(
      this.projects
    );
  }

  public getProjectRunReportHistory() {}

  private generateProjectFromDirConfigs(): Project[] {
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .map(repoName => repoName.toString())
      .filter(p => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .filter(p => fs.existsSync(path.join(this.storePath, p, configure['CONFIGURE_FILE_NAME'])))
      .map(repoName => new Project(path.join(this.storePath, repoName), repoName));
  }
}
