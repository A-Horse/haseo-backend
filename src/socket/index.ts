import * as R from 'ramda';
import * as WebSocket from 'ws';
import { verityJwt } from '../service/auth';
import { Subject } from 'rxjs/Subject';
import { setupWebsocketSubscriber } from './ws-subscriber/index';
import { WebSocketHelper } from './websocket-helper';
import { HWebSocket } from './socket';
import GlobalEmmiterInstance from '../module/project/global-emmiter';

export default function setupWS(server, ciCtrlDaemon) {
  const wss: WebSocket.Server = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', function connection(ws: HWebSocket, req) {
    const message$: Subject<SocketMessage> = new Subject();
    const wsh: WebSocketHelper = new WebSocketHelper(ws);
    ws.wsh = wsh;

    setupWebsocketSubscriber(message$, wsh, ciCtrlDaemon);

    ws.on('close', () => {
      message$.complete();
    });

    // NOTE: 这里由服务器发出去的消息也会触发事件，其实是不需要的，可以优化
    ws.on('message', (revent: string) => {
      const message: SocketMessage = JSON.parse(revent);
      message$.next(message);
    });
  });

  GlobalEmmiterInstance.on('PROJECT_BUILD_INFORMATION_UPDATE', data => {
    wss.clients.forEach((client: HWebSocket) => {
      if (!client.wsh.state.listenPrjectsUpdate) {
        return;
      }
      client.wsh.sendJSON({
        type: 'WS_PROJECT_UPDATE_SUCCESS',
        payload: data
      });
    });
  });

  GlobalEmmiterInstance.on('PROJECT_UNIT_FRAGMENT_UPDATE', data => {
    wss.clients.forEach((client: HWebSocket) => {
      if (!client.wsh.state.listenPrjectUpdateMap[data.name]) {
        return;
      }
      client.wsh.sendJSON({
        type: 'WS_PROJECT_UNIT_FRAGMENT_UPDATE_SUCCESS',
        payload: data
      });
    });
  });
}
