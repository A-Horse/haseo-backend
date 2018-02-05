import 'babel-polyfill';

import * as fs from 'fs';
import * as colors from 'colors';

const argv = require('optimist').argv;

function main(): void {
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
