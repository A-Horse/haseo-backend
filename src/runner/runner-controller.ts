import { ProjectTrigger } from "./tirgger/project-trigger";
import { ProjectManager } from "./project/project-manager";
import { TriggeredProject } from "./tirgger/triggered-project";
import { TaskManager } from "./task/task-manager";
import { RunnerContext } from "./context/runner-context";


export class RunnerController {
    constructor(private runnerContext: RunnerContext) {}

    public run(): void {
        const projectTrigger = this.runnerContext.projectTrigger;
        const projectManager = this.runnerContext.projectManager;
        const taskManager = this.runnerContext.taskManager;
        
        projectTrigger.getTriggerdItem().subscribe((triggeredProject: TriggeredProject) => {
            taskManager.registerProjectTask(triggeredProject.project);
        });


        projectTrigger.generateTirgger(projectManager.getProjects());
        projectTrigger.start();
        
        taskManager.start();
    }

    public stop(): void { 
    }
    
}