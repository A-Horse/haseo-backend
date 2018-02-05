import { exec, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as Rx from 'rxjs';

export class CommitAcquirer {
  constructor(private repoPath: string) {}

  public getRepoCurrentCommitHash(): Promise<string> {
    return new Promise((resolve, reject) => {
      const cprocess = exec(path.join(__dirname, '../../../shell/get-commit.sh'), {
        cwd: this.repoPath
      });

      let stdoutText = '';
      cprocess.stdout.on('data', data => {
        stdoutText += data.toString();
      });

      let stderrText = '';
      cprocess.stderr.on('data', data => {
        stderrText += data.toString();
      });

      cprocess.on('close', (code: number) => {
        if (!!code) {
          reject(stderrText);
        } else {
          resolve(stdoutText);
        }
      });
    });
  }
}
