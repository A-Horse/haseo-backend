import * as path from 'path';
import * as R from 'ramda';
import configure from '../../configure';
import { Project } from './project';
import { ProjectFactory } from './project-factory';
import { TriggerType } from '../tirgger/triggered-project';

export interface ProjectManagerOption {
  storePath: string;
  isSingleProject: boolean; // TODO auto
  overrideTrigger: TriggerType | null; 
}

export class ProjectManager {
  private projects: Project[];
  // private runProjectWithMeta$ = new Subject<ProjectWithMeta>();
  private storePath: string;
  public singleProject: boolean;

  constructor(private options: ProjectManagerOption) {
    this.storePath = path.join(options.storePath);
    this.singleProject = options.isSingleProject;

    this.initial();
  }

  public initial(): void {
    const projectFactory = new ProjectFactory();
    this.projects = projectFactory.generateProjects(this.storePath, this.singleProject, this.options.overrideTrigger);
  }

  public getProjects(): Project[] {
    return this.projects;
  }

  public getProjectByName(projectName: string): Project {
    return R.find((project: Project) => project.getInfomartion().name === projectName) (
      this.projects
    );
  }

  // TODO rename
  // public mapOutRunProject(projectName: string): void {
  //   // TODO put it to version-manager and report-manager
  //   // TODO 重构
  //   // TODO project-reposity
  //   const project: Project = this.getProjectByName(projectName);

  //   if (project.useGit()) {
  //     const repoPuller = new RepoPuller();
  //     repoPuller.pullRepo(project.repoPath, { askForCurrentCommit: true }).subscribe(
  //       (result: { commitHash: string; output: string }) => {
  //         // TODO 重命名 runProjectWithMeta => runProjectWithVersion
  //         this.runProjectWithMeta$.next({
  //           project,
  //           version: {
  //             commitHash: result.commitHash,
  //             output: result.output
  //           }
  //         });
  //       },
  //       async (error: { output: string }) => {
  //         const projectRunReportInitalRowId: number = await initProjectRunReport({
  //           projectName: project.name,
  //           startDate: new Date().getTime(),
  //           repoPullOuput: error.output,
  //           status: 'FAILURE',
  //           flows: project.getSetting().flow // TODO 还是统一一下，究竟是叫 flows 还是 flow，感觉还是 flows
  //         });
  //       }
  //     );
  //   } else {
  //     // TODO 重构
  //     this.runProjectWithMeta$.next({
  //       project,
  //       version: {
  //         commitHash: null,
  //         output: null
  //       }
  //     });
  //   }
  // }

  // TODO move out
  // public async getProjectCommitMessageByHash(
  //   projectName: string,
  //   commitHash: string
  // ): Promise<string> {
  //   // TODO uncomment and move it other
  //   return Promise.resolve('#FAKECOMMIT');
  //   // const project: Project = this.getProjectByName(projectName);
  //   // return Git.Commit.lookup(await Git.Repository.init(project.repoPath, 0), commitHash).then(
  //   //   commit => commit.message()
  //   // );
  // }
}
