import { Project } from './project';
import * as fs from 'fs';

export function projectSplit(repoPath: string): Project[] {
  return fs.readdirSync(repoPath)
    .filter(p => /^haseo(\.[a-zA-Z0-9]+)?\.yaml$/.test(p))
    .map(configFile => new Project(repoPath, configFile));
}
