import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';

export function dispatchMessageStream(message$, ws): void {
  const dirpath = path.join(__dirname);
  const wsSubscriptionModules = fs.readdirSync(dirpath).filter(filename => /subscription.js$/.test(filename)).map(filename => {
    return require(path.join(dirpath, filename));
  });
  const subscriptionFns = R.compose(R.flatten, R.map(R.values))(wsSubscriptionModules);
  subscriptionFns.forEach(subscriptionFn => subscriptionFn(message$, ws))
}

