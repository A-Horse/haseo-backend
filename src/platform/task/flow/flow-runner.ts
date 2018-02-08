import * as R from 'ramda';
import * as Rx from 'rxjs';
import { exec, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { OutputUnit } from './flow.module';

export class FlowRunner {
  public success$ = new Rx.Subject<OutputUnit[]>();
  public failure$ = new Rx.Subject<OutputUnit[]>();
  public unitouput$ = new Rx.Subject<OutputUnit>();
  private cprocess: ChildProcess;
  private output: OutputUnit[] = [];

  constructor(
    private flow: object,
    private option: {
      repoPath: string;
      taskEvent$: Rx.Subject<{
        type: string;
        payload: any;
      }>;
      std?: boolean;
    }
  ) {}

  public run() {
    const flow = this.flow;
    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);

    const repoPath = this.option.repoPath;

    this.cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    this.cprocess.stdout.on('data', (data: Buffer) => {
      this.handleUnitResult(data, 'stdout');
    });

    this.cprocess.stderr.on('data', (data: Buffer) => {
      this.handleUnitResult(data, 'stderr');
    });

    this.cprocess.on('close', code => {
      if (!!code) {
        this.failure$.next(this.output);
      } else {
        this.success$.next(this.output);
      }
    });
  }

  public clean(): void {
    this.cprocess.kill();
    this.unitouput$.complete();
    this.success$.complete();
    this.failure$.complete();
  }

  private handleUnitResult(data: Buffer, type: 'stdout' | 'stderr'): void {
    const outputText = this.removeDirtyAscii(data.toString());
    const outputUnit = { type, data: outputText };
    this.unitouput$.next(outputUnit);
    if (this.option.std) {
      // can not output color because stdio not in context
      // https://stackoverflow.com/questions/7725809/preserve-color-when-executing-child-process-spawn
      process.stdout.write(data.toString());
    }
    this.output.push(outputUnit);
  }

  private removeDirtyAscii(output: string): string {
    return output
      .toString()
      .replace(/\u0008/g, '')
      .replace(/\[[0-9;]*m/g, '');
  }
}
