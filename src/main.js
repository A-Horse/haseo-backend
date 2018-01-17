require('source-map-support').install();

import { CIDaemon } from './ci';
import { setupServer } from './server-setuper';

const daemon = new CIDaemon();
setupServer(daemon);
