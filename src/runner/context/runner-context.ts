import { Context } from "./context";
import { ProjectManager } from "../project/project-manager";
import { ProjectTrigger } from "../tirgger/project-trigger";
import { TaskManager } from "../task/task-manager";
import { EventBus } from "../event/event-bus";
import * as assert from 'assert';

export class RunnerContext implements Context {
    public projectManager: ProjectManager;
    public projectTrigger: ProjectTrigger;
    public taskManager: TaskManager;
    public eventBus: EventBus; 

    constructor() {}

    public setResources(
        projectManager: ProjectManager, 
        projectTrigger: ProjectTrigger, 
        taskManager: TaskManager,
        eventHub: EventBus
    ): void {
        assert(projectManager instanceof ProjectManager);
        assert(projectTrigger instanceof ProjectTrigger);
        assert(taskManager instanceof TaskManager);
        assert(eventHub instanceof EventBus);

        this.projectManager = projectManager;
        this.projectTrigger = projectTrigger;
        this.taskManager= taskManager;
        this.eventBus = eventHub;
    }
}