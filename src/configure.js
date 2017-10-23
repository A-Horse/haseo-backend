import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

class Configure {
  constructor() {
    Object.assign(
      this,
      yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config.yaml'), 'utf-8'))
    );
  }
}

export default new Configure();
