import { exec } from 'child_process';
import systemConfig from '../systemConfig';
import path from 'path';
import fs from 'fs';
import colors from 'colors';

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

  // TODO: 配置有更新需要更新
  poll() {
    if (this.state.isPulling) {
      return;
    }

    const repoPath = path.join(this.repoPath);
    this.state.isPulling = true;
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
        clearInterval(this.timer);
        this.eventEmitter.emit('repoObserverFail', output);
      } else {
        const commitIdPath = path.join(repoPath, '.commit_id');
        if (fs.existsSync(commitIdPath)) {
          this.eventEmitter.emit('newCommit', fs.readFileSync(commitIdPath));
          clearInterval(this.timer);
        }
        this.state.isPulling = false;
      }
    });
  }
}
