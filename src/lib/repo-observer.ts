import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import configure from '../configure';
import logger from '../util/logger';

export default class Observer {
  repoPath: string;
  timer: any;
  eventEmitter: EventEmitter;
  state = {
    isPulling: false
  };

  constructor(repoPath) {
    this.updateRepoPath(repoPath);
    this.eventEmitter = new EventEmitter();

    this.poll();
    this.startObserve();
  }

  getState() {
    return this.state;
  }

  updateRepoPath(repoPath) {
    this.repoPath = repoPath;
  }

  startObserve() {
    this.timer = setInterval(this.poll.bind(this), configure['DEFAULT_PULL_INTERVAL']);
  }

  stopObserve() {
    this.timer && clearInterval(this.timer);
  }

  poll() {
    logger.debug('poll function start', this.repoPath);
    if (this.state.isPulling) {
      return;
    }

    const repoPath = path.join(this.repoPath);
    this.state.isPulling = true;
    const cprocess = exec(path.join(__dirname, '../../shell/update-repo.sh'), {
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
