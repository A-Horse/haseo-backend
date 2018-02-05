import * as Rx from 'rxjs';
import { FlowController } from 'src/module/flow/flow-controller';
import { Project } from 'src/module/project/project';
import { initProjectRunReport, saveProjectRunReport } from 'src/dao/report.dao';
import { ProjectWithMeta } from 'src/module/project/project.module';

export class TaskRunner {
  public complete$ = new Rx.Subject<void>();

  constructor(private projectWithMeta: ProjectWithMeta) {}

  public async run(
    taskEvent$: Rx.Subject<{ type: string; payload: any }>
  ): Promise<Rx.Subject<void>> {
    const project: Project = this.projectWithMeta.project;
    const flowController = new FlowController(project.getSetting().flow, {
      repoPath: project.repoPath,
      taskEvent$
    });

    flowController.start();
    const projectRunReportInitalRow: { id: number } = await initProjectRunReport({
      projectName: project.name,
      startDate: new Date().getDate(),
      commitHash: this.projectWithMeta.version.commitHash,
      repoPullOuput: this.projectWithMeta.version.output
    });

    flowController.flowResult$.subscribe(null, null, async () => {
      await saveProjectRunReport(projectRunReportInitalRow.id, {
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
