import * as path from 'path';
import * as YAML from 'yamljs';
import * as fs from 'fs';
import { ProjectSetting } from './project.type';
import { TriggerType } from '../tirgger/triggered-project';

// TODO move out runner
export class Project {
  public name: string;
  public invalid: boolean;
  private configSource: string;
  private setting: ProjectSetting;

  private overrideTriggerType?: TriggerType;

  constructor(public repoPath: string, private configFileName: string) {
    this.readProjectSetting();
  }

  public getName(): string {
    return this.name;
  }

  public isUseGit() {
    return this.setting.useGit;
  }

  public getSetting(): ProjectSetting {
    return {
      ...this.setting,
      trigger: this.overrideTriggerType ? this.overrideTriggerType : this.setting.trigger
    };
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

  public getConfigSource(): string {
    return this.configSource;
  }

  public setOverrideTriggerType(overrideTriggerType: TriggerType): void {
    this.overrideTriggerType = overrideTriggerType;
  }

  private readProjectSetting(): void {
    const configFilePath = path.join(this.repoPath, this.configFileName);
    this.configSource = fs.readFileSync(configFilePath, 'utf-8');
    this.setting = YAML.load(configFilePath);
    this.setting.trigger = this.setting.trigger ?  this.setting.trigger.toUpperCase() as TriggerType : TriggerType.MANUAL;
    this.name = this.setting.name;
  }
}
