import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import { CIDaemon } from 'src/ci-daemon';
import * as WebSocket from 'ws';
import * as Rx from 'rxjs';
import { verityJwt } from '../../service/auth';
import { Observable } from 'rxjs/Observable';

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
        ws.send(JSON.stringify({ type: 'AUTH_FAILURE', error: true }));
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
  const subscriptionFns: Array<(Observable, WebSocket, CIDaemon) => void> = R.compose(
    R.flatten,
    R.map(R.values)
  )(wsSubscriptionModules);

  const authedMessage$: Observable<SocketMessage> = authMessage(message$, ws).share();

  subscriptionFns.forEach(subscriptionFn => subscriptionFn(authedMessage$, ws, daemon));
}
