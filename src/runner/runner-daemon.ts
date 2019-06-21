import { ProjectManager } from "./project/project-manager";
import { ProjectTrigger } from "./tirgger/project-trigger";
import { Runner } from "./runner";
import { RunnerController } from "./runner-controller";
import { TaskManager } from "./task/task-manager";
import { RunnerContext } from "./context/runner-context";
import { EventBus } from "./event/event-bus";
import { TriggerType } from "./tirgger/triggered-project";
import { Observable } from "rxjs";
import { TaskEvent } from "./task/task-event";

export interface RunnerDaemonOption {
    isSingleProject: boolean;// TODO rename runSingleProject
    overrideTrigger: TriggerType | null;
    storePath: string;
}

export class RunnerDaemon implements Runner {
    private projectManager: ProjectManager;
    private projectTrigger: ProjectTrigger;
    private taskManager: TaskManager;
    private context: RunnerContext;
    private eventBus: EventBus;
    private runnerController: RunnerController;

    constructor(private options: RunnerDaemonOption) {
      this.setup();
    }

    private setup(): void {
      this.eventBus = new EventBus();

      this.projectManager = new ProjectManager({
        storePath: this.options.storePath,
        isSingleProject: this.options.isSingleProject,
        overrideTrigger: this.options.overrideTrigger
      });
      
      this.projectTrigger = new ProjectTrigger();

      this.context = new RunnerContext();

      this.taskManager = new TaskManager(this.context);

      this.context.setResources(this.projectManager, this.projectTrigger, this.taskManager, this.eventBus);
      
      this.runnerController = new RunnerController(this.context);
    }

    public start(): void {
      this.runnerController.run();
    }

    public stop(): void {
      this.runnerController.stop();
    }

    public teardown(): void {
      this.eventBus.teardown();
    }

    public getTaskEvents(): Observable<TaskEvent> {
      return this.eventBus.taskRunnerEvent$.asObservable();
    }
}