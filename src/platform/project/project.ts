import * as path from 'path';
import * as YAML from 'yamljs';
import * as R from 'ramda';
import { ProjectSetting } from 'src/platform/project/project.module';

export class Project {
  public name: string;
  private setting: ProjectSetting;

  constructor(public repoPath: string, public repoName: string) {
    this.readProjectSetting();
  }

  public getInfomartion() {
    return {
      name: this.setting.name,
      flows: this.setting.flow
    };
  }

  public getSetting(): ProjectSetting {
    return this.setting;
  }

  public updateProjectConfig(): void {
    this.readProjectSetting();
  }

  private readProjectSetting(): void {
    const configFilePath = path.join(this.repoPath, 'haseo.yaml');
    this.setting = YAML.load(configFilePath);
    this.name = this.setting.name;
  }
}
