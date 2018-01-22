import * as WebSocket from 'ws';

export class WebSocketHelper {
  state: any = {
    listenPrjectUpdateMap: {}
  };

  constructor(private ws: WebSocket) {}

  public sendJSON(data: any): void {
    if (this.ws.CLOSED) {
      throw new Error('websocket closed');
    }
    this.ws.send(JSON.stringify(data));
  }
}
