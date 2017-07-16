import { exec } from 'child_process';
import systemConfig from '../systemConfig';
import path from 'path';
import fs from 'fs';

export default class Observer {
  git = null;

  constructor(projectConfig, eventEmitter) {
    this.updateConfig(projectConfig);
    this.eventEmitter = eventEmitter;
    this.poll();
  }

  updateConfig(projectConfig) {
    this.projectConfig = projectConfig;
  }

  startObserve() {}

  // checkProjectExistsAndCreate(projectConfig) {
  //   const repoPath = path.join(
  //     this.systemConfig.repoStoragePath,
  //     projectConfig.name
  //   );
  //   if (!fs.existsSync(repoPath)) {
  //     return this.initProjectWithGit(projectConfig);
  //   }
  //   return Promise.resolve();
  // }

  // initProjectWithGit(projectConfig) {
  //   return new Promise((resolve, reject) => {
  //     const process = exec(
  //       `git clone ${projectConfig.git} ${projectConfig.name}`,
  //       {
  //         cwd: this.systemConfig.repoStoragePath
  //       }
  //     );

  //     let output = '';
  //     process.stdout.on('data', data => {
  //       output += data.toString();
  //     });

  //     process.stderr.on('data', data => {
  //       output += data.toString();
  //     });

  //     process.on('close', code => {
  //       process.kill();
  //       !code ? resolve(output) : reject(output);
  //     });
  //   });
  // }

  // startObservation(projectConfig) {
  //   if (this.observations[projectConfig.name]) {
  //     clearInterval(this.observations[projectConfig.name]);
  //   }
  //   this.observations[projectConfig.name] = setInterval();
  // }

  poll() {
    const repoPath = path.join(this.projectConfig.repoPath);
    const timer = setInterval(() => {
      const cprocess = exec(path.join(__dirname, './update-repo.sh'), {
        cwd: repoPath
      });

      let output = '';
      cprocess.stdout.on('data', data => {
        output += data.toString();
      });

      cprocess.stderr.on('data', data => {
        output += data.toString();
      });

      cprocess.on('close', code => {
        if (!!code) {
          clearInterval(timer);
          this.eventEmitter.emit('repoObserverFail', output);
        } else {
          const commitIdPath = path.join(repoPath, '.commit_id');
          if (fs.existsSync(commitIdPath)) {
            this.eventEmitter.emit('newCommit', fs.readFileSync(commitIdPath));
            clearInterval(timer);
          }
        }
      });
    }, systemConfig.repoObserverInterval);
  }
}

// export function poll(repoPath) {
//   const result = exec(path.join(__dirname, './update-repo.sh'), {
//     cwd: repoPath
//   });

//   // result.stdout.on('data', data => {
//   //   console.log(data.toString());
//   // });

//   // result.stderr.on('data', data => {
//   //   console.log(data.toString());
//   // });

//   result.on('exit', code => {
//     if (fs.existsSync(path.join(repoPath, '.commit_id'))) {
//     }
//   });
// }

// export function xx(projectConfigs) {
//   projectConfigs.forEach(projectConfig => {});
// }
