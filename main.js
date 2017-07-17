import fs from 'fs';
import path from 'path';
import bluebird from 'bluebird';
import YAML from 'yamljs';
import R from 'ramda';
import express from 'express';
import WebSocket from 'ws';
import http from 'http';

import Observer from './lib/repo-observer';
import systemConfig from './systemConfig';
import DispatcherInstance from './lib/dispatcher';
import ProjectManager from './lib/project-manager';

class Controller {
  constructor() {
    this.projectManager = new ProjectManager();
  }

  startup() {}

  restart() {}
}

const daemonCtrl = new Controller();


const app = express();

app.use('/api/hi', function (req, res) {
  res.send({ msg: 'hello' });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server , path: '/ws'});

wss.on('connection', function connection(ws, req) {

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send(JSON.stringify({
    type: 'PROEJCTS_INFOMATION',
    playload: daemonCtrl.projectManager.getAllProjectInfomation()
  }));
});

server.listen(8075, function listening() {
  console.log('Listening on %d', server.address().port);
});
