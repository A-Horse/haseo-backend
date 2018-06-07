import * as R from 'ramda';
import * as Rx from 'rxjs';
import { FlowRunner } from './flow-runner';
import { Subject } from 'rxjs/Subject';

export class FlowController {
  public flowResult$ = new Rx.Subject<FlowResult>();
  public result: FlowResult[] = [];
  public status: 'INITIAL' | 'RUNNING' | 'SUCCESS' | 'FAILURE' = 'INITIAL';
  public outputUnitSequence: FlowOutputUnit[] = [];

  constructor(
    private flows: object[],
    private option: {
      repoPath: string;
      std?: boolean;
    }
  ) {
    this.flowResult$.subscribe((flowResult: FlowResult) => {
      this.result.push(flowResult);
    });
  }

  public start(): void {
    this.status = 'RUNNING';
    this.runFlows(this.flows);
  }

  // tslint:disable-next-line
  public clean(): void {}

  public getFlowOutputUnitPart(offset: number): FlowOutputUnit[] {
    const diffOutputUnitCount: number = this.outputUnitSequence.length - offset;
    const fixedCount: number = Math.max(diffOutputUnitCount, 0);
    return R.takeLast(fixedCount, this.outputUnitSequence);
  }

  private runFlows(flows: object[]): void {
    if (!flows.length) {
      this.finish('SUCCESS');
      return;
    }
    const [flowArray, restFlows] = R.splitAt(1, flows);
    const flow = R.head(flowArray);
    const flowName: string = R.keys(flow)[0];

    const flowRunner = new FlowRunner(flow, this.option);
    const startedTime: number = new Date().getTime();
    flowRunner.run();

    flowRunner.unitouput$.subscribe((outputUnit: OutputUnit) =>
      this.outputUnitSequence.push({ ...outputUnit, flowName })
    );

    flowRunner.success$.subscribe((flowResult: OutputUnit[]) => {
      const finishTime = new Date().getTime();
      this.flowResult$.next({
        status: 'SUCCESS',
        finishTime,
        duration: finishTime - startedTime,
        flowName,
        result: flowResult
      });
      this.runFlows(restFlows);
    });

    flowRunner.failure$.subscribe((flowResult: OutputUnit[]) => {
      const finishTime = new Date().getTime();
      this.flowResult$.next({
        status: 'FAILURE',
        finishTime,
        duration: finishTime - startedTime,
        flowName,
        result: flowResult
      });
      this.finish('FAILURE');
    });
  }

  private finish(type: 'SUCCESS' | 'FAILURE'): void {
    this.status = type;
    this.flowResult$.complete();
  }
}
