import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default class Observer {
  observations = new Map();
  systemConfig = null;

  constructor(systemConfig, projectConfigs) {
    this.updateConfig(systemConfig);
    if (!fs.existsSync(systemConfig.projectConfigsPath)) {
      fs.mkdirSync(systemConfig.projectConfigsPath);
    }
    this.projectConfigs = projectConfigs;
  }

  updateConfig(systemConfig) {
    this.systemConfig = systemConfig;
  }

  startObserve() {}

  checkProjectExistsAndCreate(projectConfig) {
    const repoPath = path.join(
      this.systemConfig.repoStoragePath,
      projectConfig.name
    );
    if (!fs.existsSync(repoPath)) {
      return this.initProjectWithGit(projectConfig);
    }
    return Promise.resolve();
  }

  initProjectWithGit(projectConfig) {
    return new Promise((resolve, reject) => {
      const process = exec(
        `git clone ${projectConfig.git} ${projectConfig.name}`,
        {
          cwd: this.systemConfig.repoStoragePath
        }
      );

      let output = '';
      process.stdout.on('data', data => {
        output += data.toString();
      });

      process.stderr.on('data', data => {
        output += data.toString();
      });

      process.on('close', code => {
        process.kill();
        !code ? resolve(output) : reject(output);
      });
    });
  }

  startObservation(projectConfig) {
    if (this.observations[projectConfig.name]) {
      clearInterval(this.observations[projectConfig.name]);
    }
    this.observations[projectConfig.name] = setInterval();
  }

  async poll(projectConfig) {
    const repoPath = path.join(
      this.systemConfig.repoStoragePath,
      projectConfig.name
    );
    try {
      await this.checkProjectExistsAndCreate(projectConfig);
    } catch (error) {}

    const result = exec(path.join(__dirname, './update-repo.sh'), {
      cwd: repoPath
    });

    result.on('exit', code => {
      if (fs.existsSync(path.join(repoPath, '.commit_id'))) {
      }
    });
  }

  addProject() {}
}

export function poll(repoPath) {
  const result = exec(path.join(__dirname, './update-repo.sh'), {
    cwd: repoPath
  });

  // result.stdout.on('data', data => {
  //   console.log(data.toString());
  // });

  // result.stderr.on('data', data => {
  //   console.log(data.toString());
  // });

  result.on('exit', code => {
    if (fs.existsSync(path.join(repoPath, '.commit_id'))) {
    }
  });
}

export function xx(projectConfigs) {
  projectConfigs.forEach(projectConfig => {});
}
