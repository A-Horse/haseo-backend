import WebSocket from 'ws';
import GlobalEmmiterInstance from './lib/global-emmiter';
import { verityJwt } from './service/auth';

export default function setupWS(server, daemonCtrl) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', function connection(ws, req) {
    let isAuth = false;
    let user;

    ws.on('message', revent => {
      const event = JSON.parse(revent);

      console.log(event);
      if (event.type === 'WS_AUTH_REQUEST') {
        try {
          const jwt = verityJwt(event.playload);
          console.log(jwt);
        } catch (error) {
          console.log(error);
        }
      }
    });

    ws.on('message', revent => {
      const event = JSON.parse(revent);

      switch (event.type) {
        case 'WS_GET_PROJECTS_REQUEST':
          ws.send(
            JSON.stringify({
              type: 'WS_GET_PROJECTS_SUCCESS',
              playload: daemonCtrl.projectManager.getAllProjectInfomation()
            })
          );
          break;
        case 'WS_START_PROJECT_FLOW_REQUEST':
          daemonCtrl.projectManager.startProject(event.playload.name);
          break;

        case 'WS_AUTH_REQUEST':
          break;

        default:
          break;
      }
    });
  });

  GlobalEmmiterInstance.on('buildReportUpdate', data => {
    wss.clients.forEach(client => {
      client.send(
        JSON.stringify({
          type: 'WS_PROJECT_UPDATE_SUCCESS',
          playload: data
        })
      );
    });
  });

  GlobalEmmiterInstance.on('PROJECT_UNIT_FRAGMENT_UPDATE', data => {
    wss.clients.forEach(client => {
      client.send(
        JSON.stringify({
          type: 'WS_PROJECT_UNIT_FRAGMENT_UPDATE_SUCCESS',
          playload: data
        })
      );
    });
  });
}
