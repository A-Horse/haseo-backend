import * as R from 'ramda';
import * as Rx from 'rxjs';
import * as WebSocket from 'ws';
import { verityJwt } from '../service/auth';
import { HWebSocket } from './socket.module';
import { createWebsocketReactive } from './ws-subscriber/';
import { WebSocketHelper } from './websocket-helper';

export default function setupWS(server, daemon) {
  const wsserver: WebSocket.Server = new WebSocket.Server({ server, path: '/ws' });

  wsserver.on('connection', function connection(ws: WebSocket) {
    const message$: Rx.Subject<SocketMessage> = new Rx.Subject();
    // const wshelper: WebSocketHelper = new WebSocketHelper(ws);
    // ws.wshelper = wshelper;

    createWebsocketReactive(message$, ws, daemon);
    // const authedMessage$ = message$.filter(message$)

    ws.on('close', () => {
      message$.complete();
    });

    // NOTE: send message event also trigger this listener
    ws.on('message', (revent: string) => {
      console.log('received: %s', revent);
      const message: SocketMessage = JSON.parse(revent);
      message$.next(message);
    });
  });
}
