import * as path from 'path';
import * as YAML from 'yamljs';
import * as R from 'ramda';
import * as fs from 'fs';
import { ProjectSetting } from './project.module';

export class Project {
  public name: string;
  public invalid: boolean;
  private setting: ProjectSetting;

  constructor(public repoPath: string, private configFileName: string) {
    this.readProjectSetting();
  }

  public getSetting(): ProjectSetting {
    return this.setting;
  }

  public updateProjectConfig(): void {
    this.readProjectSetting();
  }

  public getInfomartion() {
    return {
      name: this.setting.name,
      flows: this.setting.flow
    };
  }

  public getInfomartionWithoutOuput() {
    return {
      name: this.setting.name,
      flows: this.setting.flow
    };
  }

  private readProjectSetting(): void {
    const configFilePath = path.join(this.repoPath, this.configFileName);
    this.setting = YAML.load(configFilePath);
    this.name = this.setting.name;
  }
}
