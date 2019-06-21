import { Observable } from "rxjs";
import { Project } from "../../runner/project/project";
import { TriggeredProject } from "../tirgger/triggered-project";

export interface TriggerWatcher {
    startWatch(): Observable<TriggeredProject>; 
    getProject(): Project;
}