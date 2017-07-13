import { exec } from 'child_process';
import path from 'path';

export default function poll(repoPath) {
  const result = exec(path.join(__dirname, './update-repo.sh'), {
    cwd: repoPath
  });

  result.stdout.on('data', data => {
    console.log(data.toString());
  });

  result.stderr.on('data', data => {
    console.log(data.toString());
  });

  result.on('exit', code => {
    console.log(`Child exited with code ${code}`);
  });
}

poll('/Users/chchen/CI-Haseo');
