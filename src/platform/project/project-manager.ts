import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import configure from '../../configure';
import { Project } from './project';
import { Subject } from 'rxjs/Subject';
import { ProjectWithMeta } from './project.module';
import * as Git from 'nodegit';
import { RepoPuller } from '../observer/repo-puller';
import { logger } from '../../util/logger';
import { initProjectRunReport } from '../../dao/report.dao';

export class ProjectManager {
  public projects: Project[];
  public runProjectWithMeta$ = new Subject<ProjectWithMeta>();
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

  public mapOutRunProject(projectName: string): void {
    // TODO put it to version-manager and report-manager
    const project: Project = this.getProjectByName(projectName);
    const repoPuller = new RepoPuller();
    repoPuller.pullRepo(project.repoPath, { askForCurrentCommit: true }).subscribe(
      (result: { commitHash: string; output: string }) => {
        this.runProjectWithMeta$.next({
          project,
          version: {
            commitHash: result.commitHash,
            output: result.output
          }
        });
      },
      async (error: { output: string }) => {
        const projectRunReportInitalRowId: number = await initProjectRunReport({
          projectName: project.name,
          startDate: new Date().getTime(),
          repoPullOuput: error.output,
          status: 'FAILURE'
        });
      }
    );
  }

  public async getProjectCommitMessageByHash(
    projectName: string,
    commitHash: string
  ): Promise<string> {
    const project: Project = this.getProjectByName(projectName);
    return Git.Commit
      .lookup(await Git.Repository.init(project.repoPath, 0), commitHash)
      .then(commit => commit.message());
  }

  private generateProjectFromDirConfigs(): Project[] {
    return fs
      .readdirSync(this.storePath, 'utf-8')
      .map(repoName => repoName.toString())
      .filter(p => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .filter(p => fs.existsSync(path.join(this.storePath, p, configure['CONFIGURE_FILE_NAME'])))
      .map(repoName => new Project(path.join(this.storePath, repoName), repoName));
  }
}
