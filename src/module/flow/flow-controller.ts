import * as R from 'ramda';
import * as Rx from 'rxjs';
import { FlowRunner } from './flow-runner';
import { OutputUnit, FlowResult } from './flow.module';
import { Subject } from 'rxjs/Subject';

export class FlowController {
  public flowResult$ = new Rx.Subject<FlowResult>();
  public result: FlowResult[] = [];
  public status: 'INITIAL' | 'RUNING' | 'SUCCESS' | 'FAILURE' = 'INITIAL';

  constructor(
    private flows: object[],
    private option: {
      repoPath: string;
      taskEvent$: Subject<{ type: string; payload: any }>;
      std?: boolean;
    }
  ) {
    this.flowResult$.subscribe(
      (flowResult: { status: 'SUCCESS' | 'FAILURE'; flow: object; result: OutputUnit[] }) => {
        this.option.taskEvent$.next({
          type: 'PROJECT_FLOW_FINISH',
          payload: flowResult
        });
        this.result.push(flowResult);
      }
    );
  }

  public start(): void {
    this.status = 'RUNING';
    this.runFlows(this.flows);
  }

  public clean(): void {}

  private runFlows(flows: object[]): void {
    if (!flows.length) {
      this.finish('SUCCESS');
      return;
    }
    const [flow, restFlows] = R.splitAt(1, flows);

    const flowRunner = new FlowRunner(flow, this.option);
    flowRunner.run();
    flowRunner.success$.subscribe((flowResult: OutputUnit[]) => {
      this.flowResult$.next({
        status: 'SUCCESS',
        flow,
        result: flowResult
      });
      this.runFlows(restFlows);
    });
    flowRunner.failure$.subscribe((flowResult: OutputUnit[]) => {
      this.flowResult$.next({
        status: 'FAILURE',
        flow,
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