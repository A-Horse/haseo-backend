import express from 'express';
import http from 'http';

import ProjectManager from './lib/project-manager';

import setupWS from './ws';

class Controller {
  constructor() {
    this.projectManager = new ProjectManager();
  }

  startup() {}

  restart() {}
}

const daemonCtrl = new Controller();
const app = express();

app.use('/api/alive', function(req, res) {
  res.send({ msg: 'alive' });
});

const server = http.createServer(app);
setupWS(server, daemonCtrl);

server.listen(8075, function listening() {
  console.log('Listening on %d', server.address().port);
});
