import './of-type.operator';
import { Subject } from 'rxjs/Subject';
import { CIDaemon } from 'src/ci';
import { WebSocketHelper } from 'src/socket/websocket-helper';
import { verityJwt } from '../../service/auth';


export const WS_AUTH_REQUEST = (message$: Subject<SocketMessage>, wsh: WebSocketHelper, ciCtrlDaemon: CIDaemon) =>
  message$.ofType('WS_AUTH_REQUEST').subscribe((message: SocketMessage) => {
    try {
      const user = verityJwt(message.payload).data;
      wsh.state.isAuth = true;
      wsh.state.user = user;

      wsh.sendJSON({
        type: 'WS_AUTH_SUCCESS'
      });
    } catch (error) {
      wsh.sendJSON({
        type: 'WS_AUTH_FAILURE'
      });
    }
  });
