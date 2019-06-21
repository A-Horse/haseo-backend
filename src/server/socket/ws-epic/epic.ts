import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import * as WebSocket from 'ws';
import { Subject, Observable } from 'rxjs';
import { verityJwt } from '../../../service/auth';
import { SocketMessage } from '../../../entity/socket-message';
import { User } from '../../../entity/user';
import { filter, tap, map } from 'rxjs/operators';
import { RunnerDaemon } from '../../../runner/runner-daemon';

// import './operator/of-type.operator';

// function authMessage(
//   message$: Subject<SocketMessage>,
//   ws: WebSocket
// ): Observable<SocketMessage> {
//   return message$
//     .pipe(map((message: SocketMessage): SocketMessage => {
//       let user: User;
//       try {
//         user = message.meta.jwt ? verityJwt(message.meta.jwt).data : null;
//       } catch (error) {
//         /* ignore */
//       }
//       return R.mergeDeepRight(message, { meta: { user } });
//     }), 
//     tap((message: SocketMessage): void => {
//         if (!message.meta.user) {
//           ws.send(JSON.stringify({ type: 'WS_AUTH_FAILURE', error: true }));
//         }
//       }),
//       filter((message: SocketMessage): boolean => {
//         return !!message.meta.user;
//       })
//     );
// }

export function createWebsocketReactive(
  message$: Subject<SocketMessage>,
  ws: WebSocket,
  daemon: RunnerDaemon
): void {
  
}
