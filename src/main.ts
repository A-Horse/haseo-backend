require('source-map-support').install();
process.on('unhandledRejection', console.log);

import { CIDaemon } from './ci-daemon';
import { setupServer } from './server-setuper';
import { checkAdminCreate } from './util/admin-creater';

function main() {
  const daemon = new CIDaemon();
  try {
    checkAdminCreate();
    setupServer(daemon);
  } catch (error) {
    console.error('Setup Server error', error);
  }
}

main();
