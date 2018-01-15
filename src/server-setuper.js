// @flow
import express from 'express';
import http from 'http';
import setupWS from './socket/index';

import './init-setup';

import UserRouter from './router/user';

export function setupServer(ciDaemonCtrl) {
  const app = express();

  app.use(require('body-parser').json());

  app.use('/api/alive', function(req, res) {
    res.send({ msg: 'alive' });
  });
  app.use('/api/', UserRouter);

  const server = http.createServer(app);
  setupWS(server, ciDaemonCtrl);

  server.listen(8075, function listening() {
    console.log('Listening on %d', server.address().port);
  });
}
