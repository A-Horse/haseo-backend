import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import * as WebSocket from 'ws';
import * as Rx from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { CIDaemon } from '../../platform/ci-daemon';
import { verityJwt } from '../../service/auth';

import './operator/of-type.operator';

function authMessage(
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket
): Rx.Observable<SocketMessage> {
  return message$
    .map((message: SocketMessage): SocketMessage => {
      const user: User = message.meta.jwt ? verityJwt(message.meta.jwt).data : null;
      return R.mergeDeepRight(message, { meta: { user } });
    })
    .do((message: SocketMessage): void => {
      if (!message.meta.user) {
        ws.send(JSON.stringify({ type: 'WS_AUTH_FAILURE', error: true }));
      }
    })
    .filter((message: SocketMessage): boolean => {
      return !!message.meta.user;
    });
}

export function createWebsocketReactive(
  message$: Rx.Subject<SocketMessage>,
  ws: WebSocket,
  daemon: CIDaemon
): void {
  const dirpath = path.join(__dirname);
  const wsSubscriptionModules = fs
    .readdirSync(dirpath)
    .filter(filename => /subscriber.js$/.test(filename))
    .map(filename => {
      return require(path.join(dirpath, filename));
    });

  const epicFns: Array<(Observable, CIDaemon, WebSocket) => Rx.Observable<any>> = R.compose(
    R.flatten,
    R.map(R.values)
  )(wsSubscriptionModules);

  const authedMessage$: Rx.Observable<SocketMessage> = authMessage(message$, ws).share();

  const output$ = new Rx.Subject<any>();

  epicFns.forEach((epicFn: (Observable, CIDaemon, WebSocket) => Rx.Observable<any>): void => {
    epicFn(authedMessage$, daemon, ws).subscribe(output$);
  });

  output$.subscribe((output: object): void => {
    if (ws.readyState !== 1) {
      return;
    }
    ws.send(JSON.stringify(output));
  });

  // subscriptionFns.forEach(subscriptionFn => subscriptionFn(authedMessage$, ws, daemon));
}
