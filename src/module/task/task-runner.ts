import * as Rx from 'rxjs';
import { ProjectWithPullResult } from 'src/module/observer/observer.module';
import { FlowController } from 'src/module/flow/flow-controller';
import Project from 'src/module/project/project';
import { initProjectRunReport, saveProjectRunReport } from 'src/dao/report.dao';

export class TaskRunner {
  public complete$ = new Rx.Subject<void>();

  constructor(private projectWithPullResult: ProjectWithPullResult) {}

  public async run(
    taskEvent$: Rx.Subject<{ type: string; payload: any }>
  ): Promise<Rx.Subject<void>> {
    const project: Project = this.projectWithPullResult.project;
    const flowController = new FlowController(project.setting.flow, {
      repoPath: project.repoPath,
      taskEvent$
    });

    flowController.start();
    const projectRunReportInitalColumn: { id: number } = await initProjectRunReport({
      projectName: project.name,
      startDate: new Date().getDate(),
      commitHash: this.projectWithPullResult.pullResult.commitHash,
      repoPullOuput: this.projectWithPullResult.pullResult.output
    });

    flowController.flowResult$.subscribe(null, null, async () => {
      await saveProjectRunReport(projectRunReportInitalColumn.id, {
        result: flowController.result,
        status: flowController.status
      });
      flowController.clean();
      this.complete$.next();
      this.complete$.complete();
    });

    return this.complete$;
  }
}
