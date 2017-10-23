import WebSocket from 'ws';
import GlobalEmmiterInstance from './lib/global-emmiter';

export default function setupWS(server, daemonCtrl) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', function connection(ws, req) {
    ws.on('message', revent => {
      const event = JSON.parse(revent);
      console.log(event);
      switch (event.type) {
        case 'GET_PROJECTS':
          ws.send(
            JSON.stringify({
              type: 'PROJECTS',
              playload: daemonCtrl.projectManager.getAllProjectInfomation()
            })
          );
          break;
        case 'START_PROJECT_FLOW':
          daemonCtrl.projectManager.startProject(event.playload.name);
          break;
        default:
          break;
      }
    });
  });

  GlobalEmmiterInstance.on('projectStatusUpdate', data => {
    wss.clients.forEach(client => {
      client.send(
        JSON.stringify({
          type: 'PROJECT_UPDATE',
          playload: data
        })
      );
    });
  });

  GlobalEmmiterInstance.on('PROJECT_UNIT_FRAGMENT_UPDATE', data => {
    wss.clients.forEach(client => {
      client.send(
        JSON.stringify({
          type: 'PROJECT_UNIT_FRAGMENT_UPDATE',
          playload: data
        })
      );
    });
  });
}
