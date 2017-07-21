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

  constructor(projectConfig, eventEmitter) {
    this.updateConfig(projectConfig);
    this.eventEmitter = eventEmitter;

    this.setupEventListen();

    this.poll(true);
    this.startObserve();
  }

  setupEventListen() {
    this.eventEmitter.on('flowFinish', () => {
      this.startObserve();
    });
  }

  updateConfig(projectConfig) {
    this.projectConfig = projectConfig;
  }

  startObserve() {
    this.timer = setInterval(this.poll.bind(this), systemConfig.repoObserverInterval);
  }

  stopObserve() {
    this.timer && clearInterval(this.timer);
  }

  poll(forceRun) {
    if (this.state.isPulling) {
      return;
    }

    const repoPath = path.join(this.projectConfig.repoPath);
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
        } else if (forceRun) {
          this.eventEmitter.emit('newCommit', 'HEAD');
          clearInterval(this.timer);
        }
        this.state.isPulling = false;
      }
    });
  }
}
