import * as WebSocket from 'ws';
import * as http from 'http';
import { Subject } from 'rxjs';
import { SocketMessage } from '../../entity/socket-message';
import { SocketEpicController } from './socket-epic-controller';
import { RunnerDaemon } from '../../runner/runner-daemon';

export class SocketServer {
    private wsserver: WebSocket.Server;

    constructor(private server: http.Server, private daemon: RunnerDaemon) {
      this.wsserver = new WebSocket.Server({server: this.server, path: '/ws'});
    }

    public start(): void {
      this.wsserver.on('connection', (ws: WebSocket) => {
        const message$: Subject<SocketMessage> = new Subject();
        
        ws.on('message', (event: string) => {
          const message = JSON.parse(event)
          message$.next(message)
        });

        ws.on('close', () => {
          message$.complete();
        });

        this.setupMessageReactive(message$, ws);
        this.setupRunnerDeamonMessagePublish();
      });
    }

    private setupMessageReactive(message$: Subject<SocketMessage>, ws: WebSocket): void {
      const socketEpicController = new SocketEpicController();
      socketEpicController.createSocketEpicReactive(message$, this.daemon, ws);
    }

    private setupRunnerDeamonMessagePublish(): void {
      this.daemon.getTaskEvent$().subscribe((taskEvent: FSAction) => {
        this.wsserver.clients.forEach((client: WebSocket): void => {
          const type = 'WS_TASK_' + taskEvent.type + '_SUCCESS';
          if (client.readyState !== 1) {
            return;
          }
          client.send(
            JSON.stringify({
              payload: taskEvent
              type
            })
          );
        });
      });
    }
}