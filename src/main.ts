// tslint:disable-next-line
require('source-map-support').install();
process.on('unhandledRejection', console.error);

import { CIDaemon } from './runner/ci-daemon';
import { serve } from './server';

function main() {
  const daemon = new CIDaemon();
  daemon.startup();

  serve(daemon);
}

main();
