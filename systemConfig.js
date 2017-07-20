import path from 'path';

const systemConfig = {
  repoStoragePath: path.join(__dirname, 'REPOS'),
  repoObserverInterval: 60 * 1000
};

export default systemConfig;
