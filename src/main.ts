require('source-map-support').install();
process.on('unhandledRejection', console.log);

import { CIDaemon } from './ci';
import { setupServer } from './server-setuper';

const daemon = new CIDaemon();
setupServer(daemon);
