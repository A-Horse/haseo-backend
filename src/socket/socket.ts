import * as WebSocket from 'ws';
import { WebSocketHelper } from './websocket-helper';

export class HWebSocket extends WebSocket {
  wsh?: WebSocketHelper;
}
