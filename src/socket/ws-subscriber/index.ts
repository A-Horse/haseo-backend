import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import { WebSocketHelper } from 'src/socket/websocket-helper';
import { CIDaemon } from 'src/ci';
import { setupMessageInterceptor } from './message-interceptor';

export function setupWebsocketSubscriber(message$, wsh: WebSocketHelper, ciCtrlDaemon: CIDaemon): void {
  const dirpath = path.join(__dirname);
  const wsSubscriptionModules = fs.readdirSync(dirpath).filter(filename => /subscriber.js$/.test(filename)).map(filename => {
    return require(path.join(dirpath, filename));
  });
  const subscriptionFns = R.compose(R.flatten, R.map(R.values))(wsSubscriptionModules);

  setupMessageInterceptor(message$, wsh);
  subscriptionFns.forEach(subscriptionFn => subscriptionFn(message$, wsh, ciCtrlDaemon))
}

