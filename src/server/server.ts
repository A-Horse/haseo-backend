import * as express from 'express';
import * as http from 'http';
import UserRouter from './router/user';
import configure from '../configure';
import { RunnerDaemon } from '../runner/runner-daemon';
import { SocketServer } from './socket/socket-server';
import { Runner } from '../runner/runner';

export class AppServer {
    private app: express.Application;
    private server: http.Server;
    private socketServer: SocketServer;

    constructor(private daemon: RunnerDaemon) {}

    public serve() {
      this.app = express();

      this.app.use(require('body-parser').json());
      this.app.use('/api/alive', (req, res) => {
        res.send({ msg: 'alive' });
      });
      this.app.use('/api/', UserRouter);
    
      this.server = http.createServer(this.app);
    
      this.server.listen(configure['SERVE_PORT'], () => {
        // tslint:disable-next-line
        console.log('Listening on %d', this.server.address(), configure['SERVE_PORT']);
      });

      this.startSocketServe(this.server);
    }

    private startSocketServe(server: http.Server) {
      this.socketServer = new SocketServer(this.server, this.daemon);
      this.socketServer.start();
    }
}


