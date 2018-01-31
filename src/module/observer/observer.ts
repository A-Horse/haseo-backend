import * as fs from 'fs';
import * as path from 'path';
import * as Rx from 'rxjs';
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import configure from '../../configure';
import logger from '../../util/logger';
import Project from 'src/module/project/project';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export default class Observer {
  repoPath: string;
  timer: any;
  eventEmitter: EventEmitter;
  state = {
    isPulling: false
  };
  complete$ = new Rx.Subject();
  commit$ = new Rx.Subject();

  constructor(project: Project) {
    this.repoPath = project.repoPath;
  }

  start(): Subject<any> {
    const requestPull$ = Observable.create(observer => {
      this.pullRepo().subscribe(observer);

      return () => {};
    });

    return requestPull$.repeat().delay(configure['']);
  }

  getState() {
    return this.state;
  }

  updateRepoPath(repoPath) {}

  pullRepo(): Observable<any> {
    const subject$ = new Subject();
    const repoPath = path.join(this.repoPath);
    this.state.isPulling = true;
    const cprocess = exec(path.join(__dirname, '../../../shell/update-repo.sh'), {
      cwd: repoPath
    });

    let output = '';
    cprocess.stdout.on('data', data => {
      output += data.toString();
    });

    cprocess.stderr.on('data', data => {
      output += data.toString();
    });

    cprocess.on('close', (code: number) => {
      cprocess.kill();
      if (!!code) {
        subject$.error({ output });
      } else {
        const commitIdPath = path.join(repoPath, '.commit_id');
        if (fs.existsSync(commitIdPath)) {
          subject$.next({
            commitHash: fs.readFileSync(commitIdPath),
            output: output
          });
        }
      }
      subject$.complete();
    });
    return subject$.take(1);
  }

  poll() {
    if (this.state.isPulling) {
      return;
    }

    const repoPath = path.join(this.repoPath);
    this.state.isPulling = true;
    const cprocess = exec(path.join(__dirname, '../../../shell/update-repo.sh'), {
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
      cprocess.kill();
      logger.info(`polling shell ouput ${this.repoPath} ${code} ${output}`);
      if (!!code) {
        logger.error(`polling shell ouput error ${this.repoPath} ${code} ${output}`);
        this.eventEmitter.emit('OBSERVE_ERROR', output);
      } else {
        const commitIdPath = path.join(repoPath, '.commit_id');
        if (fs.existsSync(commitIdPath)) {
          logger.info(`polling shell output has new commit ${this.repoPath}`);
          this.eventEmitter.emit('OBSERVE_NEW_COMMIT', fs.readFileSync(commitIdPath));
          this.stopObserve();
        }
        this.state.isPulling = false;
      }
    });
  }
}
