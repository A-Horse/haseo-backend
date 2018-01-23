import './of-type.operator';
import { Subject } from 'rxjs/Subject';
import { CIDaemon } from 'src/ci-daemon';
import { WebSocketHelper } from 'src/socket/websocket-helper';

export const WS_GET_PROJECTS_REQUEST = (
  message$: Subject<SocketMessage>,
  wsh: WebSocketHelper,
  ciCtrlDaemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECTS_REQUEST').subscribe((message: SocketMessage) => {
    wsh.sendJSON({
      type: 'WS_GET_PROJECTS_SUCCESS',
      payload: ciCtrlDaemon.projectManager.getAllProjectInfomation()
    });
  });

export const WS_GET_PROJECT_DETAIL_REQUEST = (
  message$: Subject<SocketMessage>,
  wsh: WebSocketHelper,
  ciCtrlDaemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_DETAIL_REQUEST').subscribe(async (message: SocketMessage) => {
    const payload: { name: string } = message.payload;
    const projectDetail = await ciCtrlDaemon.projectManager.getProjectDetailByName(payload.name);
    wsh.sendJSON({
      type: 'WS_GET_PROJECT_DETAIL_SUCCESS',
      payload: projectDetail
    });
  });

export const WS_LISTEN_PROJECTS_UPDATE_REQUEST = (
  message$: Subject<SocketMessage>,
  wsh: WebSocketHelper,
  ciCtrlDaemon: CIDaemon
) =>
  message$.ofType('WS_LISTEN_PROJECTS_UPDATE_REQUEST').subscribe(async (message: SocketMessage) => {
    wsh.state.listenPrjectsUpdate = true;
  });

export const WS_START_PROJECT_FLOW_REQUEST = (
  message$: Subject<SocketMessage>,
  wsh: WebSocketHelper,
  ciCtrlDaemon: CIDaemon
) =>
  message$.ofType('WS_START_PROJECT_FLOW_REQUEST').subscribe(async (message: SocketMessage) => {
    ciCtrlDaemon.projectManager.startProject(message.payload.name);
  });

export const WS_GET_PROJECT_REPORT_REQUEST = (
  message$: Subject<SocketMessage>,
  wsh: WebSocketHelper,
  ciCtrlDaemon: CIDaemon
) =>
  message$.ofType('WS_GET_PROJECT_REPORT_REQUEST').subscribe(async (message: SocketMessage) => {
    const payload: { name: string; reportId: string } = message.payload;
    wsh.sendJSON({
      type: 'WS_GET_PROJECT_REPORT_SUCCESS',
      payload: await ciCtrlDaemon.projectManager.getProjectReport(
        message.payload.name,
        message.payload.reportId
      )
    });
  });
