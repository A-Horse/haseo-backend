import { exec } from 'child_process';
import systemConfig from '../systemConfig';
import path from 'path';
import fs from 'fs';
import logger from '../util/logger';

export default class Observer {
  git = null;
  state = {
    isPulling: false
  };

  constructor(repoPath, eventEmitter) {
    this.updateRepoPath(repoPath);
    this.eventEmitter = eventEmitter;

    this.setupEventListen();

    this.poll();
    this.startObserve();
  }

  setupEventListen() {
    this.eventEmitter.on('flowFinish', () => {
      logger.info(`start git pull observer ${this.repoPath}`);
      this.startObserve();
    });
  }

  updateRepoPath(repoPath) {
    this.repoPath = repoPath;
  }

  startObserve() {
    this.timer = setInterval(this.poll.bind(this), systemConfig.repoObserverInterval);
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
      logger.info(`polling shell ouput ${this.repoPath} ${code} ${output}`);
      if (!!code) {
        logger.error(`polling shell ouput error ${this.repoPath} ${code} ${output}`);
        this.eventEmitter.emit('repoObserverFail', output);
      } else {
        const commitIdPath = path.join(repoPath, '.commit_id');
        if (fs.existsSync(commitIdPath)) {
          logger.info(`polling shell output has new commit ${this.repoPath}`);
          this.eventEmitter.emit('newCommit', fs.readFileSync(commitIdPath));
          clearInterval(this.timer);
        }
        this.state.isPulling = false;
      }
    });
  }
}
