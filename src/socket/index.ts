import * as R from 'ramda';
import * as Rx from 'rxjs';
import * as WebSocket from 'ws';
import { verityJwt } from '../service/auth';
import { createWebsocketReactive } from './ws-epic/';
import { CIDaemon } from '../platform/ci-daemon';

export function startWebSocketServe(server, daemon: CIDaemon) {
  const wsserver: WebSocket.Server = new WebSocket.Server({ server, path: '/ws' });

  wsserver.on('connection', function connection(ws: WebSocket) {
    const message$: Rx.Subject<SocketMessage> = new Rx.Subject();

    createWebsocketReactive(message$, ws, daemon);

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

  daemon.getTaskEvent$().subscribe(taskEvent => {
    console.log(taskEvent);
  });
}
