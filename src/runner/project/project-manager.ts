import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import configure from '../../configure';
import { Project } from './project';
import { Subject } from 'rxjs/Subject';
import { ProjectWithMeta } from './project.type';
// import * as Git from 'nodegit';
import { RepoPuller } from '../observer/repo-puller';
import { initProjectRunReport } from '../../dao/report.dao';
import { projectSplit } from './project-splitter';

export class ProjectManager {
  public projects: Project[];
  public runProjectWithMeta$ = new Subject<ProjectWithMeta>();

  private storePath: string = path.join(configure['REPO_STORAGE_PATH']);

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

  // TODO rename
  public mapOutRunProject(projectName: string): void {
    // TODO put it to version-manager and report-manager
    // TODO 重构
    // TODO project-reposity
    const project: Project = this.getProjectByName(projectName);

    if (project.useGit()) {
      const repoPuller = new RepoPuller();
      repoPuller.pullRepo(project.repoPath, { askForCurrentCommit: true }).subscribe(
        (result: { commitHash: string; output: string }) => {
          // TODO 重命名 runProjectWithMeta => runProjectWithVersion
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
            status: 'FAILURE',
            flows: project.getSetting().flow // TODO 还是统一一下，究竟是叫 flows 还是 flow，感觉还是 flows
          });
        }
      );
    } else {
      // TODO 重构
      this.runProjectWithMeta$.next({
        project,
        version: {
          commitHash: null,
          output: null
        }
      });
    }
  }

  public async getProjectCommitMessageByHash(
    projectName: string,
    commitHash: string
  ): Promise<string> {
    // TODO uncomment and move it other
    return Promise.resolve('#FAKECOMMIT');
    // const project: Project = this.getProjectByName(projectName);
    // return Git.Commit.lookup(await Git.Repository.init(project.repoPath, 0), commitHash).then(
    //   commit => commit.message()
    // );
  }

  private generateProjectFromDirConfigs(): Project[] {
    return fs
      .readdirSync(this.storePath)
      .map(repoName => (<any>repoName).toString())
      .filter((p: string) => fs.lstatSync(path.join(this.storePath, p)).isDirectory())
      .filter(p => {
        const files = fs.readdirSync(path.join(this.storePath, p));
        return R.any(f => /^\.?haseo(\.[a-zA-Z0-9]+)?\.yaml$/.test(f))(files);
      })
      .map(p => path.join(this.storePath, p))
      .map(projectSplit)
      .reduce((collection: Project[], projects: Project[]): Project[] => {
        return collection.concat(projects);
      }, []);
  }
}
