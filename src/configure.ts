import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

class Configure {
  constructor() {
    const configYamlFilePath = path.join(__dirname, '../config.yaml');
    const configUserYamlFilePath = path.join(__dirname, '../config.user.yaml');
    Object.assign(this, {
      ...yaml.safeLoad(fs.readFileSync(configYamlFilePath, 'utf-8')),
      ...fs.existsSync(configUserYamlFilePath)
        ? yaml.safeLoad(fs.readFileSync(configUserYamlFilePath, 'utf-8'))
        : {}
    });
  }
}

export default new Configure();
