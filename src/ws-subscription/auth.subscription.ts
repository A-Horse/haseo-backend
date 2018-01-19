import './of-type.operator';
import { Subject } from 'rxjs/Subject';

export const WS_AUTH_REQUEST = (message$: Subject<SocketMessage>, ws) =>
  message$.ofType('WS_AUTH_REQUEST').subscribe((message: SocketMessage) => {
    console.log(message, 'jojojojojo');
  });
