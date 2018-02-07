import * as R from 'ramda';
import * as WebSocket from 'ws';
import { verityJwt } from '../service/auth';
import { Subject } from 'rxjs/Subject';
import { setupWebsocketSubscriber } from './ws-subscriber/index';
import { WebSocketHelper } from './websocket-helper';
import { HWebSocket } from './socket';

export default function setupWS(server, daemon) {
  const wsserver: WebSocket.Server = new WebSocket.Server({ server, path: '/ws' });

  wsserver.on('connection', function connection(ws: HWebSocket, req) {
    const message$: Subject<SocketMessage> = new Subject();
    const wshelper: WebSocketHelper = new WebSocketHelper(ws);
    ws.wshelper = wshelper;

    setupWebsocketSubscriber(message$, wshelper, daemon);

    ws.on('close', () => {
      message$.complete();
    });

    // send message event also trigger this listener
    ws.on('message', (revent: string) => {
      const message: SocketMessage = JSON.parse(revent);
      message$.next(message);
    });
  });

  // GlobalEmmiterInstance.on('PROJECT_UNIT_FRAGMENT_UPDATE', data => {
  //   wsserver.clients.forEach((client: HWebSocket) => {
  //     if (!client.wsh.state.listenPrjectUpdateMap[data.name]) {
  //       return;
  //     }
  //     client.wsh.sendJSON({
  //       type: 'WS_PROJECT_UNIT_FRAGMENT_UPDATE_SUCCESS',
  //       payload: data
  //     });
  //   });
  // });
}
