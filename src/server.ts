import * as express from 'express';
import * as http from 'http';
import { startWebSocketServe } from './socket/index';
import UserRouter from './router/user';
import configure from './configure';

export function serve(daemon) {
  const app = express();

  app.use(require('body-parser').json());

  app.use('/api/alive', (req, res) => {
    res.send({ msg: 'alive' });
  });

  app.use('/api/', UserRouter);

  const server = http.createServer(app);
  startWebSocketServe(server, daemon);

  server.listen(configure['SERVE_PORT'], function listening() {
    // tslint:disable-next-line
    console.log('Listening on %d', server.address(), configure['SERVE_PORT']);
  });
}
