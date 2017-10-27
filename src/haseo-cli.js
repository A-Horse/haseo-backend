import 'babel-polyfill';

import fs from 'fs';
import colors from 'colors';
import Project from './lib/project';

import logger from './util/logger';
logger.transports[0].level = 'error';

const argv = require('optimist').argv;

function main() {
  if (!fs.existsSync('haseo.yaml')) {
    console.log(
      colors.bold.red('Error: '),
      colors.red('Can not found `haseo.yaml`, please cd haseo configured project and retry.`')
    );
  }

  const project = new Project('.', 'Project', {
    isStandlone: true
  });

  project.start();
}

main();
