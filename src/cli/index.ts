import 'babel-polyfill';

import * as fs from 'fs';
import colors from 'colors';

import logger from '../util/logger';
import Project from '..//module/project/project';
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
    watch: false
  });

  project.start();
}

main();
