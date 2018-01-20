import './of-type.operator';
import { Subject } from 'rxjs/Subject';
import { CIDaemon } from 'src/ci';
import { WebSocketHelper } from 'src/socket/websocket-helper';

export const WS_AUTH_REQUEST = (message$: Subject<SocketMessage>, ws: WebSocketHelper, ciCtrlDaemon: CIDaemon) =>
  message$.ofType('WS_AUTH_REQUEST').subscribe((message: SocketMessage) => {

    const user = verityJwt(event.payload).data;
    isAuth = true;
    
    ws.sendJSON({
      type: 'WS_AUTH_SUCCESS'
    });
 
  });
