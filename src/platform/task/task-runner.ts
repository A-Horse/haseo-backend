import * as Rx from 'rxjs';
import { Project } from '../project/project';
import { initProjectRunReport, saveProjectRunReport } from '../../dao/report.dao';
import { ProjectWithMeta } from '../project/project.module';
import { FlowController } from '../task/flow/flow-controller';

export class TaskRunner {
  public reportId: number;
  public complete$ = new Rx.Subject<void>();
  private flowController: FlowController;

  constructor(
    private projectWithMeta: ProjectWithMeta,
    private taskEvent$: Rx.Subject<{ type: string; payload: any }>
  ) {
    this.flowController = new FlowController(projectWithMeta.project.getSetting().flow, {
      repoPath: projectWithMeta.project.repoPath
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

    this.notifyFlowStart(projectRunReportInitalRowId);

    this.flowController.flowResult$.subscribe(
      (flowResult: FlowResult): void => {
        this.notfiyFlowUnitUpdate(flowResult, projectRunReportInitalRowId);
      },
      null,
      async () => {
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
      }
    );
  }

  private assignRepotId(reportId: number): void {
    this.reportId = reportId;
  }

  private notifyFlowStart(reportId: number): void {
    this.taskEvent$.next({
      type: 'PROJECT_FLOW_START',
      payload: {
        report: {
          id: reportId
        }
      }
    });
  }

  private notfiyFlowUnitUpdate(flowResult: FlowResult, reportId: number): void {
    this.taskEvent$.next({
      type: 'PROJECT_FLOW_UNIT_UPDATE',
      payload: {
        project: {
          name: this.projectWithMeta.project.name
        },
        report: {
          status: this.flowController.status,
          flowResult,
          id: reportId
        }
      }
    });
  }
}
