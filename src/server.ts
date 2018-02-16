import * as express from 'express';
import * as http from 'http';
import { startWebSocketServe } from './socket/index';
import { checkAdminCreate } from './util/admin-creater';

import UserRouter from './router/user';

export function serve(daemon) {
  checkAdminCreate();

  const app = express();

  app.use(require('body-parser').json());

  app.use('/api/alive', (req, res) => {
    res.send({ msg: 'alive' });
  });

  app.use('/api/', UserRouter);

  const server = http.createServer(app);
  startWebSocketServe(server, daemon);

  server.listen(8075, function listening() {
    // tslint:disable-next-line
    console.log('Listening on %d', server.address().port);
  });
}
