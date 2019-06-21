import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import { Project } from "./project";
import configure from '../../configure';
import { TriggerType } from '../tirgger/triggered-project';

interface CreateProjectInput {
  projectPath: string;
  configFilePath: string;
}

export function findConfigsInProject(projectPath: string): Array<CreateProjectInput> {
  return fs.readdirSync(projectPath)
    .filter(p => /^\.?haseo(\.[a-zA-Z0-9]+)?\.yaml$/.test(p))
    .map((configFilePath: string) => {
      return {
        projectPath,
        configFilePath
      };
    });
}

export function filterProjectDirByConfigFileExist(): boolean {
  return true;
}

export class ProjectFactory {
  
  public generateProjects( storePath: string, singleProject: boolean, overrideTriggerType?: TriggerType): Project[] {
      if (singleProject) {
        return [this.generateProject(storePath, configure.get('DEFAULT_CONFIG_FILE_NAME'), overrideTriggerType)];
      }
      return this.generateProjectsFromDirConfig(storePath);
    }

  private generateProject(projectPath: string, configFileName: string = configure.get('DEFAULT_CONFIG_FILE_NAME'), overrideTriggerType?: TriggerType): Project {
    const project = new Project(projectPath, path.join(projectPath, configFileName));
    project.setOverrideTriggerType(overrideTriggerType);
    return project;
  }

  private generateProjectsFromDirConfig(projectsPath: string): Project[] {
    return fs
      .readdirSync(projectsPath, 'utf8')
      .map(repoName => (<any>repoName).toString())
      .filter((p: string) => fs.lstatSync(path.join(projectsPath, p)).isDirectory())
      .filter(p => {
        const files = fs.readdirSync(path.join(projectsPath, p));
        return R.any(f => /^\.?haseo(\.[a-zA-Z0-9]+)?\.yaml$/.test(f))(files);
      })
      .map(p => path.join(projectsPath, p))
      .map(findConfigsInProject)
      .reduce((collection: CreateProjectInput[], projectInputs: CreateProjectInput[]): CreateProjectInput[] => {
        return collection.concat(projectInputs);
      }, [])
      .map((createProjectInput: CreateProjectInput) => {
        return new Project(createProjectInput.projectPath, createProjectInput.configFilePath);
      });
  }
}