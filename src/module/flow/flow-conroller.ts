import * as R from 'ramda';
import { FlowRunner } from './flow-runner';

export class FlowController {
  constructor(private flows: object[], private options: { repoPath: string; std: boolean }) {}

  public start(): void {}

  private runFlows(flows: object[]): void {
    if (!flows.length) {
      return;
    }
    const [flow, restFlows] = R.splitAt(1, flows);

    const flowRunner = new FlowRunner(flow, this.options);
    flowRunner.run();
    flowRunner.success$;
  }
}
