// tslint:disable-next-line
require('source-map-support').install();
process.on('unhandledRejection', console.log);

import { CIDaemon } from './ci-daemon';
import { serve } from './server';

function main() {
  const daemon = new CIDaemon();
  daemon.startup();

  serve(daemon);
}

main();
