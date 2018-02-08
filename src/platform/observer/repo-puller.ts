import * as fs from 'fs';
import * as path from 'path';
import * as Rx from 'rxjs';
import { exec, ChildProcess } from 'child_process';
import configure from '../../configure';
import { Project } from '../project/project';
import { RepoVersion } from './observer.module';

export class RepoPuller {
  private cprocess: ChildProcess;

  public pullRepo(repoPath: string): Rx.Observable<RepoVersion> {
    const subject$ = new Rx.Subject<RepoVersion>();
    this.cprocess = exec(path.join(__dirname, '../../../shell/update-repo.sh'), {
      cwd: repoPath
    });

    let output = '';
    this.cprocess.stdout.on('data', data => {
      output += data.toString();
    });

    this.cprocess.stderr.on('data', data => {
      output += data.toString();
    });

    this.cprocess.on('close', (code: number) => {
      if (!!code) {
        subject$.error({ output });
      } else {
        const commitIdPath = path.join(repoPath, '.commit_id');
        if (fs.existsSync(commitIdPath)) {
          subject$.next({
            commitHash: fs.readFileSync(commitIdPath).toString(),
            output
          });
        }
      }
      subject$.complete();
    });
    return subject$.take(1);
  }

  public clean(): void {
    this.cprocess.kill();
  }
}
