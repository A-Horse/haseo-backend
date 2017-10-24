import express from 'express';
import http from 'http';
import setupWS from './ws';

export function setupServer(ciDaemonCtrl) {
  const app = express();

  app.use('/api/alive', function(req, res) {
    res.send({ msg: 'alive' });
  });

  const server = http.createServer(app);
  setupWS(server, ciDaemonCtrl);

  server.listen(8075, function listening() {
    console.log('Listening on %d', server.address().port);
  });
}
