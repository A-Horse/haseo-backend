import * as Rx from 'rxjs';
import * as WebSocket from 'ws';
import { CIDaemon } from 'src/ci-daemon';
import { Project } from '../../platform/project/project';
import { insureProjectExist } from '../subscriber-middle';

import './operator/of-type.operator';

export const WS_GET_PROJECTS_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECTS_REQUEST').subscribe((message: SocketMessage): void => {
    ws.send(
      JSON.stringify({
        type: 'WS_GET_PROJECTS_SUCCESS',
        payload: daemon.getProjects().map((project: Project) => project.getInfomartion())
      })
    );
  });

export const WS_GET_PROJECT_REPORT_HISTORY_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket,
  daemon: CIDaemon
) =>
  message$
    .ofType('WS_GET_PROJECT_REPORT_HISTORY_REQUEST')
    .filter(
      insureProjectExist(ws, daemon, {
        errorType: 'WS_GET_PROJECT_REPORT_HISTORY_FAILURE'
      })
    )
    .subscribe(async (message: SocketMessage): Promise<void> => {
      const payload: { name: string; offset: number; limit: number } = message.payload;
      const reportHistory = await daemon.getProjectLastRunReportHistory(payload.name);

      ws.send(
        JSON.stringify({
          type: 'WS_GET_PROJECT_REPORT_HISTORY_SUCCESS',
          payload: reportHistory
        })
      );
    });

// export const WS_LISTEN_PROJECTS_UPDATE_REQUEST = (
//   message$: Rx.Subject<SocketMessage>,
//   wsh: WebSocketHelper,
//   daemon: CIDaemon
// ) =>
//   message$.ofType('WS_LISTEN_PROJECTS_UPDATE_REQUEST').subscribe(async (message: SocketMessage) => {
//     wsh.state.listenPrjectsUpdate = true;
//   });

export const WS_START_PROJECT_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket,
  daemon: CIDaemon
) =>
  message$
    .ofType('WS_START_PROJECT_REQUEST')
    .filter(
      insureProjectExist(ws, daemon, {
        errorType: 'WS_START_PROJECT_FAILURE'
      })
    )
    .subscribe(async (message: SocketMessage) => {
      daemon.mapOutRunProject(message.payload.name);
      ws.send(
        JSON.stringify({
          type: 'WS_START_PROJECT_SUCCESS'
        })
      );
    });

export const WS_GET_PROJECT_REPORT_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket,
  daemon: CIDaemon
) =>
  message$
    .ofType('WS_GET_PROJECT_REPORT_REQUEST')
    .filter(
      insureProjectExist(ws, daemon, {
        errorType: 'WS_GET_PROJECT_REPORT_FAILURE'
      })
    )
    .subscribe(async (message: SocketMessage) => {
      const payload: { name: string; reportId: string } = message.payload;

      ws.send(
        JSON.stringify({
          type: 'WS_GET_PROJECT_REPORT_SUCCESS',
          payload: await daemon.getProjectRunReport(message.payload.name, message.payload.reportId)
        })
      );
    });

export const WS_GET_PROJECT_REPORT_OUTPUT_PART_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket,
  daemon: CIDaemon
) =>
  message$
    .ofType('WS_GET_PROJECT_REPORT_OUTPUT_PART_REQUEST')
    .filter(
      insureProjectExist(ws, daemon, {
        errorType: 'WS_GET_PROJECT_REPORT_OUTPUT_PART_FAILURE'
      })
    )
    .subscribe((message: SocketMessage) => {
      const payload: { name: string; reportId: number; offset: number } = message.payload;

      ws.send(
        JSON.stringify({
          type: 'WS_GET_PROJECT_REPORT_OUTPUT_PART_SUCCESS',
          payload: daemon.queryTaskRunnerOutputPartByReportId(payload.reportId, payload.offset)
        })
      );
    });
