import * as R from 'ramda';
import * as WebSocket from 'ws';
import { verityJwt } from '../service/auth';
import GlobalEmmiterInstance from '../module/project/global-emmiter';

export default function setupWS(server, ciCtrlDaemon) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', function connection(ws, req) {
    let isAuth = false;
    let user;

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
          user = verityJwt(event.payload).data;
          isAuth = true;

          ws.sendJSON({
            type: 'WS_AUTH_SUCCESS'
          });
        } catch (error) {
          console.error(error);
          ws.sendJSON({
            type: 'WS_AUTH_FAILURE'
          });
        }
      }
    });

    ws.on('message', async revent => {
      const event = JSON.parse(revent);
      const [actionName, status] = R.compose(R.map(R.join('_')), R.splitAt(-1), R.split('_'))(
        event.type
      );

      if (!isAuth) {
        ws.sendJSON({
          type: actionName + '_FAILURE',
          error: true,
          payload: 'UNAUTH'
        });
        return;
      }

      try {
        switch (event.type) {
          case 'WS_GET_PROJECTS_REQUEST':
            ws.sendJSON({
              type: 'WS_GET_PROJECTS_SUCCESS',
              payload: ciCtrlDaemon.projectManager.getAllProjectInfomation()
            });
            break;

          case 'WS_GET_PROJECT_DETAIL_REQUEST':
            const projectDetail = await ciCtrlDaemon.projectManager.getProjectDetailByName(
              event.payload.name
            );
            ws.sendJSON({
              type: 'WS_GET_PROJECT_DETAIL_SUCCESS',
              payload: projectDetail
            });
            break;

          case 'WS_LISTEN_PROJECTS_UPDATE_REQUEST':
            ws.state.listenPrjectsUpdate = true;
            break;

          case 'WS_START_PROJECT_FLOW_REQUEST':
            ciCtrlDaemon.projectManager.startProject(event.payload.name);
            break;

          case 'WS_AUTH_REQUEST':
            break;

          case 'WS_GET_PROJECT_REPORT_REQUEST':
          ws.sendJSON({
              type: 'WS_GET_PROJECT_REPORT_SUCCESS',
              payload: await ciCtrlDaemon.projectManager.getProjectReport(
                event.payload.name,
                event.payload.reportId
              )
            });
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(error);
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
        payload: data
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
        payload: data
      });
    });
  });
}
