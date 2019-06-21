import { Project } from "../../runner/project/project";
import { Subject } from "rxjs";
import { TriggeredProject } from "./triggered-project";

export interface Trigger {
    generateTirgger(projects: Project[]): void;
    start(): void;
    getTriggerdItem(): Subject<TriggeredProject>;
}