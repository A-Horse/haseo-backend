import { Subject } from "rxjs";
import { Observable } from "rxjs";
import { TaskEvent } from "../task/task-event";

export class EventBus {
    public taskRunnerEvent$: Subject<TaskEvent> = new Subject();

    constructor() {}

    public getEvents(): Observable<any> {
        return this.taskRunnerEvent$.asObservable();
    }

    public teardown() {
        this.taskRunnerEvent$.complete();
    }
}