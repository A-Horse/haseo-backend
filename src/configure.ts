import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

class Configure {
  private configureMap: {[key: string]: string};

  constructor() {
    const configYamlFilePath = path.join(__dirname, '../config.yaml');
    const configUserYamlFilePath = process.env['HASEO_CONFIG_PATH'] || path.join(process.env['HOME'], '.haseo-config.yaml');

    this.configureMap = {
      ...yaml.safeLoad(fs.readFileSync(configYamlFilePath, 'utf-8')),
      ...fs.existsSync(configUserYamlFilePath)
        ? yaml.safeLoad(fs.readFileSync(configUserYamlFilePath, 'utf-8'))
        : {}
    }

    Object.assign(this, this.configureMap);
  }

  public get(key: string): string {
    return this.configureMap[key];
  }
}

export default new Configure();
