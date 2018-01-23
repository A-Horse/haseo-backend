import { WebSocketHelper } from 'src/socket/websocket-helper';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

export function setupMessageInterceptor(
  message$: Subject<SocketMessage>,
  wsh: WebSocketHelper
): Observable<SocketMessage> {
  message$.do((message: SocketMessage) => {
    if (message.type !== 'WS_AUTH_REQUEST') {
      if (!wsh.state.isAuth) {
        doWhenUnauth(wsh);
      }
    }
  });

  return message$.filter((message: SocketMessage) => {
    if (message.type !== 'WS_AUTH_REQUEST') {
      return !!wsh.state.isAuth;
    }
    return true;
  });
}

export function doWhenUnauth(wsh: WebSocketHelper): void {
  wsh.sendJSON({
    type: 'WS_AUTH_FAILURE',
    error: true,
    payload: 'UNAUTH'
  });
}
