import * as WebSocket from 'ws';

export class WebSocketHelper {
  state: any = {
    listenPrjectUpdateMap: {}
  };

  constructor(private ws: WebSocket) {}

  public sendJSON(data: any): void {
    this.ws.send(JSON.stringify(data));
  }
}
