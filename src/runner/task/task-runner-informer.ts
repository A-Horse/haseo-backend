import { TaskRunner } from "./task-runner";
import { RunnerContext } from "../context/runner-context";
import { TASK_START_TYPE, PROJECT_FLOW_UNIT_UPDATE } from "./event";
import { TaskEvent } from "./task-event";

export class TaskRunnerInformer {
  constructor(private taskRunner: TaskRunner, private context: RunnerContext) {}
    
  public notifyFlowStart(): void {
    this.context.eventBus.taskRunnerEvent$.next(new TaskEvent({
      type: TASK_START_TYPE,
      payload: {
        projectTask: this.taskRunner.getProjectTask(),
        flowStatus: this.taskRunner.getFlowController().status
      }
    }));
  }

  public notfiyFlowUnitUpdated(flowResult: FlowResult, reportId: number): void {
    this.context.eventBus.taskRunnerEvent$.next({
      type: PROJECT_FLOW_UNIT_UPDATE,
      payload: {
        projectTask: this.taskRunner.getProjectTask(),
      }
    });
  }
}