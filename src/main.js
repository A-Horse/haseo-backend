import { CIDaemon } from './ci';
import { setupServer } from './server';

const daemon = new CIDaemon();
setupServer(daemon);
