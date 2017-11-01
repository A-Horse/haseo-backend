import R from 'ramda';
import WebSocket from 'ws';
import GlobalEmmiterInstance from '../lib/global-emmiter';
import { verityJwt } from '../service/auth';

export default function setupWS(server, daemonCtrl) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', function connection(ws, req) {
    let isAuth = false;
    let user;
    const state = {
      listenPrjectUpdateMap: {}
    };
    ws.state = {
      listenPrjectUpdateMap: {}
    };

    ws.sendJSON = function(data) {
      return ws.send(JSON.stringify(data));
    };

    ws.on('message', revent => {
      const event = JSON.parse(revent);
      if (event.type === 'WS_AUTH_REQUEST') {
        try {
          user = verityJwt(event.playload).data;
          isAuth = true;

          ws.sendJSON({
            type: 'WS_AUTH_SUCCESS'
          });
        } catch (error) {
          ws.sendJSON({
            type: 'WS_AUTH_FAILURE'
          });
        }
      }
    });

    ws.on('message', revent => {
      const event = JSON.parse(revent);
      const [actionName, status] = R.compose(R.map(R.join('_')), R.splitAt(-1), R.split('_'))(
        event.type
      );

      if (!isAuth) {
        ws.sendJSON({
          type: actionName + '_FAILURE',
          error: true,
          playload: 'UNAUTH'
        });
        return;
      }

      switch (event.type) {
        case 'WS_GET_PROJECTS_REQUEST':
          ws.send(
            JSON.stringify({
              type: 'WS_GET_PROJECTS_SUCCESS',
              playload: daemonCtrl.projectManager.getAllProjectInfomation()
            })
          );
          break;

        case 'WS_LISTEN_PROJECTS_UPDATE_REQUEST':
          ws.state.listenPrjectsUpdate = true;
          // state.listenPrjectsUpdate = true;
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

  GlobalEmmiterInstance.on('PROJECT_BUILD_INFORMATION_UPDATE', data => {
    wss.clients.forEach(client => {
      if (!client.state.listenPrjectsUpdate) {
        return;
      }
      client.sendJSON({
        type: 'WS_PROJECT_UPDATE_SUCCESS',
        playload: data
      });
    });
  });

  GlobalEmmiterInstance.on('PROJECT_UNIT_FRAGMENT_UPDATE', data => {
    wss.clients.forEach(client => {
      if (!client.state.listenPrjectUpdateMap[data.name]) {
        return;
      }
      client.sendJSON({
        type: 'WS_PROJECT_UNIT_FRAGMENT_UPDATE_SUCCESS',
        playload: data
      });
    });
  });
}
