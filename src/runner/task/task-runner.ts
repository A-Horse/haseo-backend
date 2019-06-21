import { FlowController } from '../task/flow/flow-controller';
import { ProjecTask } from './project-task';
import { RunnerContext } from '../context/runner-context';
import { TaskIdBuilder } from './task-id-builder';
import { TASK_START_TYPE } from './event';
import { TaskRunnerInformer } from './task-runner-informer';
import { Observable, Subject } from 'rxjs';
import { Project } from '../project/project';

export class TaskRunner {
  private id: string;
  private flowController: FlowController;
  private informer: TaskRunnerInformer;

  public complete$ = new Subject<void>();

  constructor(
    private projecTask: ProjecTask,
    private runnerContext: RunnerContext
  ) {
    const taskIdBuilder = new TaskIdBuilder()
    this.id = taskIdBuilder.generateId();

    this.flowController = new FlowController(this.projecTask.project.getSetting().flow, {
      repoPath: projecTask.project.repoPath,
      std: true
    });

    this.informer = new TaskRunnerInformer(this, this.runnerContext);
  }

  public getID(): string {
    return this.id;
  }

  public getStatus(): string {
    return this.flowController.status;
  }

  public getProjectTask(): ProjecTask {
    return this.projecTask;
  }

  public getFlowController(): FlowController {
    return this.flowController;
  }

  public queryRunOutputPart(offset: number): FlowOutputUnit[] {
    return this.flowController.getFlowOutputUnitPart(offset);
  }

  public run(): void {
    // TODO
    // save initial in report module =>
    // flowController.start() =>
    // subscribe stop
    this.flowController.start();

    // const projectRunReportInitalRowId: number = await initProjectRunReport({
    //   projectName: this.projecTask.project.name,
    //   startDate: new Date().getTime(),
    //   commitHash: this.projecTask.version.commitHash,
    //   repoPullOuput: this.projecTask.version.output,
    //   status: this.flowController.status,
    //   flows: this.projecTask.project.getSetting().flow
    // });

    // this.notifyFlowStart(projectRunReportInitalRowId);

    this.informer.notifyFlowStart();

    this.flowController.flowResult$.subscribe(
      (flowResult: FlowResult): void => {
        // this.notfiyFlowUnitUpdate(flowResult, projectRunReportInitalRowId);
        // this.informer
        
      },
      null,
      async () => {
         // await saveProjectRunReport(projectRunReportInitalRowId, {
          //   result: this.flowController.result,
          //   status: this.flowController.status,
          //   flows: this.projecTask.project.getSetting().flow
          // });


        this.flowController.clean();
        this.complete$.next();
        this.complete$.complete();
      }
    );
  }

  
}
