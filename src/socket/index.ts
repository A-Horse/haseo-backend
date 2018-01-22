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

    console.log(1);
    setupWebsocketSubscriber(message$, wsh, ciCtrlDaemon);

    console.log(2);

    ws.on('close', () => {
      message$.complete();
    });

    ws.on('message', (revent: string) => {
      const message: SocketMessage = JSON.parse(revent);
      const [actionName, status] = R.compose(R.map(R.join('_')), R.splitAt(-1), R.split('_'))(
        message.type
      );

      console.log(actionName, status);
      if (!wsh.state.isAuth) {
        console.log(2.5);
        wsh.sendJSON({
          type: 'AUTH_FAILURE',
          error: true,
          payload: 'UNAUTH'
        });
        return;
      }

      console.log(3);
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
