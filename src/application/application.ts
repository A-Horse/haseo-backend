import { RunnerDaemon } from "../runner/runner-daemon";
import { TriggerType } from "../runner/tirgger/triggered-project";
import configure from "../configure";
import { AppServer } from "../server/server";
import { MessageCenter } from "../message/message-center";
import { ReportManager } from "../report/report-manager";

export interface ApplicationOption {
  server?: boolean;
  trigger?: string;
  report?: boolean;
}

export class Application {
    constructor() {}

    start(option: ApplicationOption) {
        const runSingleProject = !option.server;

        const daemon = new RunnerDaemon({
            isSingleProject: runSingleProject,
            overrideTrigger: option.trigger ? (option.trigger as string).toUpperCase() as TriggerType : null,
            storePath: runSingleProject ? configure.get('REPO_STORAGE_PATH') : '.' 
        });

        daemon.start();

        const useReport: boolean = option.server || option.report;

        if (useReport) {
            const messageCenter = new MessageCenter(daemon);
            const reportManager = new ReportManager();
        }

        // TODO 整理一下
        if (option.server) {
            
            const appServer = new AppServer(daemon);
            appServer.serve();

        }

    }
}