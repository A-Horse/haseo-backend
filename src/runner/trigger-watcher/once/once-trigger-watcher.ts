import { TriggerWatcher } from '../trigger-watcher';
import { Observable, of } from 'rxjs';
import { TriggeredProject, TriggerType } from '../../tirgger/triggered-project';
import { Project } from '../../../runner/project/project';

export class OnceTriggerWatcher implements TriggerWatcher {
    readonly type = TriggerType.ONCE;

    constructor(private project: Project) {}

    public startWatch(): Observable<TriggeredProject> {
        return of(new TriggeredProject(this.project, this.type))
    }

    public getProject(): Project {
      return this.project;
    }
}