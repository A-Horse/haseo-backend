import { Observable, Subject } from "rxjs";
import * as R from 'ramda';
import { SocketMessage } from "../../../entity/socket-message";
import { map, tap, filter } from "rxjs/operators";
import { User } from "../../../entity/user";
import { verityJwt } from "../../../service/auth";
import * as WebSocket from 'ws';

export function authMessage(
    message$: Subject<SocketMessage>,
    ws: WebSocket
  ): Observable<SocketMessage> {
    return message$
      .pipe(map((message: SocketMessage): SocketMessage => {
        let user: User;
        try {
          user = message.meta.jwt ? verityJwt(message.meta.jwt) : null;
        } catch (error) {
          /* ignore */
        }
        return R.mergeDeepRight(message, { meta: { user } });
      }), 
      tap((message: SocketMessage): void => {
          if (!message.meta.user) {
            ws.send(JSON.stringify({ type: 'WS_AUTH_FAILURE', error: true }));
          }
        }),
        filter((message: SocketMessage): boolean => {
          return !!message.meta.user;
        })
      );
  }