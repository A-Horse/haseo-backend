import * as path from 'path';
import * as YAML from 'yamljs';
import * as R from 'ramda';
import * as fs from 'fs';
import { ProjectSetting } from './project.module';

export class Project {
  public name: string;
  public invalid: boolean;
  private setting: ProjectSetting;

  constructor(public repoPath: string, public repoName: string) {
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
      flows: this.setting.flow.map((flow: FlowResult) => {
        return R.omit(['result'], flow);
      })
    };
  }

  private readProjectSetting(): void {
    const userConfigFilePath = path.join(this.repoPath, 'haseo.user.yaml');
    const configFilePath = path.join(this.repoPath, 'haseo.yaml');
    if (fs.existsSync(userConfigFilePath)) {
      this.setting = YAML.load(userConfigFilePath);
    } else if (fs.existsSync(configFilePath)) {
      this.setting = YAML.load(configFilePath);
    } else {
      this.invalid = true;
      throw new Error('Can not find project haseo file.')
    }

    this.setting = YAML.load(configFilePath);
    this.name = this.setting.name;
  }
}
