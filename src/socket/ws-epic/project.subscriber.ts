import * as Rx from 'rxjs';
import * as WebSocket from 'ws';
import { CIDaemon } from 'src/platform/ci-daemon';
import { Project } from '../../platform/project/project';
import { projectExistMiddle } from './middle/project.epic.middle';
import { createActionType } from '../util/action.util';

export const WS_GET_PROJECTS_REQUEST = (message$: Rx.Subject<SocketMessage>, daemon: CIDaemon) =>
  message$.ofType('WS_GET_PROJECTS_REQUEST').map((message: SocketMessage) => {
    return {
      type: 'WS_GET_PROJECTS_SUCCESS',
      payload: daemon.getProjects().map((project: Project) => project.getInfomartion())
    };
  });

export const WS_GET_PROJECT_LAST_REPORT_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_LAST_REPORT_REQUEST').mergeMap(
    projectExistMiddle(
      daemon,
      'WS_GET_PROJECT_LAST_REPORT_FAILURE',
      async (message: SocketMessage): Promise<FSAction> => {
        const payload: { name: string; offset: number; limit: number } = message.payload;
        const reportHistory = await daemon.getProjectLastRunReport(payload.name);
        return {
          type: 'WS_GET_PROJECT_LAST_REPORT_SUCCESS',
          payload: reportHistory
        };
      }
    )
  );

export const WS_START_PROJECT_FLOW_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) => {
  const actionType: ActionType = createActionType('WS_START_PROJECT_FLOW');
  return message$.ofType(actionType.REQUEST).mergeMap(async (message: SocketMessage) => {
    daemon.mapOutRunProject(message.payload.name);
    return {
      type: actionType.SUCCESS
    };
  });
};

export const WS_GET_PROJECT_REPORT_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_REPORT_REQUEST').mergeMap(async (message: SocketMessage) => {
    const payload: { name: string; reportId: string } = message.payload;
    return {
      type: 'WS_GET_PROJECT_REPORT_SUCCESS',
      payload: await daemon.getProjectRunReport(message.payload.name, message.payload.reportId)
    };
  });

export const WS_GET_PROJECT_REPORT_OUTPUT_PART_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_REPORT_OUTPUT_PART_REQUEST').merge((message: SocketMessage) => {
    const payload: { name: string; reportId: number; offset: number } = message.payload;
    return {
      type: 'WS_GET_PROJECT_REPORT_OUTPUT_PART_SUCCESS',
      payload: daemon.queryTaskRunnerOutputPartByReportId(payload.reportId, payload.offset)
    };
  });
