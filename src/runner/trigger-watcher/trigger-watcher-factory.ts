import { TriggerWatcher } from "./trigger-watcher";
import { Project } from "../../runner/project/project";
import { GitTriggerWatcher } from "./git/git-trigger-watcher";
import { CronTriggerWatcher } from "./cron/cron-trigger-watcher";
import { OnceTriggerWatcher } from "./once/once-trigger-watcher";
import { TriggerType } from "../tirgger/triggered-project";
import { ManualTriggerWatcher } from "./manual/manual-trigger-watcher";

export class TriggerWatcherFactory {
    constructor() {}

    static genTriggerWatcher(project: Project, forceOnce?: boolean): TriggerWatcher  {
        if (forceOnce) {
          return new OnceTriggerWatcher(project);
        }

        const triggerType = project.getSetting().trigger;
        switch (triggerType) {
            case TriggerType.GIT:
                return new GitTriggerWatcher(project);
            case TriggerType.SCHEDUE:
                return new CronTriggerWatcher(project);
            case TriggerType.ONCE:
                return new OnceTriggerWatcher(project);
            case TriggerType.MANUAL:
                return new ManualTriggerWatcher(project);
            default:
                throw new Error(`Can generate project trigger [${triggerType}]`);
        }
    }
}