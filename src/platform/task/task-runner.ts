import * as Rx from 'rxjs';
import { Project } from '../project/project';
import { initProjectRunReport, saveProjectRunReport } from '../../dao/report.dao';
import { ProjectWithMeta } from '../project/project.module';
import { FlowController } from '../task/flow/flow-controller';
import { FlowOutputUnit } from '../task/flow/flow.module';

export class TaskRunner {
  public reportId: number;
  public complete$ = new Rx.Subject<void>();
  private flowController: FlowController;

  constructor(
    private projectWithMeta: ProjectWithMeta,
    private taskEvent$: Rx.Subject<{ type: string; payload: any }>
  ) {
    this.flowController = new FlowController(projectWithMeta.project.getSetting().flow, {
      repoPath: projectWithMeta.project.repoPath,
      taskEvent$: this.taskEvent$
    });
  }

  public queryRunOutputPart(offset: number): FlowOutputUnit[] {
    return this.flowController.getFlowOutputUnitPart(offset);
  }

  public async run(): Promise<void> {
    this.flowController.start();
    const projectRunReportInitalRowId: number = await initProjectRunReport({
      projectName: this.projectWithMeta.project.name,
      startDate: new Date().getTime(),
      commitHash: this.projectWithMeta.version.commitHash,
      repoPullOuput: this.projectWithMeta.version.output,
      status: this.flowController.status
    });

    this.flowController.flowResult$.subscribe(null, null, async () => {
      try {
        await saveProjectRunReport(projectRunReportInitalRowId, {
          result: this.flowController.result,
          status: this.flowController.status
        });
      } catch (error) {
        // tslint:disable-next-line
        console.error(error);
      }

      this.flowController.clean();
      this.complete$.next();
      this.complete$.complete();
    });
  }

  private assignRepotId(reportId: number): void {
    this.reportId = reportId;
  }
}
