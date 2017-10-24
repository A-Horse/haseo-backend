import path from 'path';

const systemConfig = {
  repoStoragePath: path.join(__dirname, '../REPOS'),
  repoObserverInterval: 20 * 1000
};

export default systemConfig;