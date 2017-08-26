import path from 'path';

const systemConfig = {
  repoStoragePath: path.join(__dirname, 'REPOS'),
  repoObserverInterval: 10 * 1000
};

export default systemConfig;
