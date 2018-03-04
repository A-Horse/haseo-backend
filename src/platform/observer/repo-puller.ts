import * as fs from 'fs';
import * as path from 'path';
import * as Rx from 'rxjs';
import { exec, ChildProcess } from 'child_process';
import configure from '../../configure';
import { Project } from '../project/project';
import { RepoVersion } from './observer.module';
import { repoLogger } from '../../util/logger';
import { CommitAcquirer } from '../version/commit-acquirer';

export class RepoPuller {
  private cprocess: ChildProcess;

  public pullRepo(
    repoPath: string,
    options: { askForCurrentCommit: boolean } = { askForCurrentCommit: false }
  ): Rx.Observable<RepoVersion> {
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

    this.cprocess.on('close', async (code: number) => {
      if (!!code) {
        subject$.error({ output });
      } else {
        const commitIdPath = path.join(repoPath, '.commit_id');
        if (fs.existsSync(commitIdPath)) {
          const commitHash = fs.readFileSync(commitIdPath).toString();
          subject$.next({ commitHash, output });
        } else if (options.askForCurrentCommit) {
          const commitAcquirer: CommitAcquirer = new CommitAcquirer(repoPath);
          const commitHash: string = await commitAcquirer.getRepoCurrentCommitHash();
          subject$.next({ commitHash, output });
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
