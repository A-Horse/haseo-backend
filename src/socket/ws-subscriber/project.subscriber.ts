import * as Rx from 'rxjs';
import { CIDaemon } from 'src/ci-daemon';
import { WebSocketHelper } from 'src/socket/websocket-helper';
import { Project } from 'src/module/project/project';
import './operator/of-type.operator';
import { insureProjectExist } from 'src/socket/subscriber-middle';

export const WS_GET_PROJECTS_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  wsh: WebSocketHelper,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECTS_REQUEST').subscribe((message: SocketMessage): void => {
    wsh.sendJSON({
      type: 'WS_GET_PROJECTS_SUCCESS',
      payload: daemon.getProjects().map((project: Project) => project.getInfomartion())
    });
  });

export const WS_GET_PROJECT_REPORT_HISTORY_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  wsh: WebSocketHelper,
  daemon: CIDaemon
) =>
  message$
    .ofType('WS_GET_PROJECT_REPORT_HISTORY_REQUEST')
    .filter(
      insureProjectExist(wsh, daemon, {
        errorType: 'WS_GET_PROJECT_REPORT_HISTORY_FAILURE'
      })
    )
    .subscribe(async (message: SocketMessage): Promise<void> => {
      const payload: { name: string; offset: number; limit: number } = message.payload;
      const reportHistory = await daemon.getProjectLastRunReportHistory(payload.name);

      wsh.sendJSON({
        type: 'WS_GET_PROJECT_REPORT_HISTORY_SUCCESS',
        payload: reportHistory
      });
    });

// export const WS_LISTEN_PROJECTS_UPDATE_REQUEST = (
//   message$: Rx.Subject<SocketMessage>,
//   wsh: WebSocketHelper,
//   daemon: CIDaemon
// ) =>
//   message$.ofType('WS_LISTEN_PROJECTS_UPDATE_REQUEST').subscribe(async (message: SocketMessage) => {
//     wsh.state.listenPrjectsUpdate = true;
//   });

export const WS_START_PROJECT_FLOW_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  wsh: WebSocketHelper,
  daemon: CIDaemon
) =>
  message$
    .ofType('WS_START_PROJECT_REQUEST')
    .filter(
      insureProjectExist(wsh, daemon, {
        errorType: 'WS_START_PROJECT_FAILURE'
      })
    )
    .subscribe(async (message: SocketMessage) => {
      daemon.startProject(message.payload.name);
      wsh.sendJSON({
        type: 'WS_START_PROJECT_SUCCESS',
        payload: reportHistory
      });
    });

export const WS_GET_PROJECT_REPORT_REQUEST = (
  message$: Rx.Subject<SocketMessage>,
  wsh: WebSocketHelper,
  daemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_REPORT_REQUEST').subscribe(async (message: SocketMessage) => {
    const payload: { name: string; reportId: string } = message.payload;
    wsh.sendJSON({
      type: 'WS_GET_PROJECT_REPORT_SUCCESS',
      payload: await daemon.projectManager.getProjectReport(
        message.payload.name,
        message.payload.reportId
      )
    });
  });
