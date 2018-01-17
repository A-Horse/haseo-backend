import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

class Configure {
  constructor() {
    Object.assign(
      this,
      yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config.yaml'), 'utf-8'))
    );
  }
}

export default new Configure();
