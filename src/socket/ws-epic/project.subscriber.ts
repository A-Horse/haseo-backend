import * as Rx from 'rxjs';
import * as WebSocket from 'ws';
import { CIDaemon } from 'src/platform/ci-daemon';
import { Project } from '../../platform/project/project';
import { projectExistMiddle } from './middle/project.epic.middle';
import { createActionType } from '../util/action.util';

export const WS_GET_PROJECTS_REQUEST = (message$: Rx.Subject<SocketMessage>, daemon: CIDaemon) => {
  const actionType: ActionType = createActionType('WS_GET_PROJECTS');
  return message$.ofType(actionType.REQUEST).map((message: SocketMessage) => {
    return {
      type: actionType.SUCCESS,
      payload: daemon.getProjects().map((project: Project) => project.getInfomartion())
    };
  });
};

export const WS_GET_PROJECT_REQUEST = (message$: Rx.Subject<SocketMessage>, daemon: CIDaemon) => {
  const actionType: ActionType = createActionType('WS_GET_PROJECT');
  return message$.ofType(actionType.REQUEST).map(
    projectExistMiddle(daemon, actionType.FAILURE, (message: SocketMessage) => {
      return {
        type: actionType.SUCCESS,
        payload: daemon.getProjectByName(message.payload.name).getInfomartion()
      };
    })
  );
};

export const WS_GET_PROJECT_COMMIT_MESSAGE_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) => {
  const actionType: ActionType = createActionType('WS_GET_PROEJCT_COMMIT_MESSAGE');
  return message$.ofType(actionType.REQUEST).mergeMap(
    projectExistMiddle(daemon, actionType.FAILURE, async (message: SocketMessage) => {
      return {
        type: actionType.SUCCESS,
        payload: await daemon.getProjectCommitMessageByHash(
          message.payload.name,
          message.payload.commitHash
        ),
        meta: {
          projectName: message.payload.name,
          reportId: parseInt(message.payload.reportId, 10)
        }
      };
    })
  );
};

export const WS_GET_PROJECT_REPORT_HISTORY_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) => {
  const actionType: ActionType = createActionType('WS_GET_PROJECT_REPORT_HISTORY');
  return message$.ofType(actionType.REQUEST).mergeMap(
    projectExistMiddle(daemon, actionType.FAILURE, async (message: SocketMessage): Promise<
      FSAction
    > => {
      const payload: { name: string; offset: number; limit: number } = message.payload;
      const reportHistory = await daemon.getProjectRunReportHistory(
        payload.name,
        payload.limit,
        payload.offset
      );
      return {
        type: actionType.SUCCESS,
        payload: reportHistory
      };
    })
  );
};

export const WS_GET_PROJECT_LAST_REPORT_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_LAST_REPORT_REQUEST').mergeMap(
    projectExistMiddle(
      daemon,
      'WS_GET_PROJECT_LAST_REPORT_FAILURE',
      async (message: SocketMessage): Promise<FSAction> => {
        const payload: { name: string } = message.payload;
        const report = await daemon.getProjectLastRunReport(payload.name);
        return {
          type: 'WS_GET_PROJECT_LAST_REPORT_SUCCESS',
          payload: report
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
) => {
  const actionType: ActionType = createActionType('WS_GET_PROJECT_REPORT');
  return message$.ofType(actionType.REQUEST).mergeMap(async (message: SocketMessage) => {
    const payload: { id: number } = message.payload;

    // TODO: valide middle
    if (!payload.id && payload.id !== 0) {
      return {
        type: actionType.FAILURE,
        error: true
      };
    }

    return {
      type: actionType.SUCCESS,
      payload: await daemon.getProjectRunReport(payload.id)
    };
  });
};

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
