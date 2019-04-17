process.on('unhandledRejection', console.error);

import 'babel-polyfill';

import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import * as colors from 'colors';
import { Project } from '../runner/project/project';  
import { CommitAcquirer } from '../runner/version/commit-acquirer';
import { ProjectWithMeta } from '../runner/project/project.type';
import { FlowController } from '../runner/task/flow/flow-controller';


// tslint:disable:no-console
async function main(): Promise<void> {
  const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString())
    .version;

  console.log(colors.green('➤'), ' Haseo cli version: ', colors.yellow(version));
  console.log();

  if (!fs.existsSync('haseo.yaml')) {
    console.log(
      colors.bold.red('Error: '),
      colors.red('Can not found `haseo.yaml`, please cd haseo configured project and retry.`')
    );
    return;
  }

  const repoName = R.takeLast(1, path.resolve('.').split('/'));

  const project = new Project('.', 'haseo.yaml');
  const commitAcquirer: CommitAcquirer = new CommitAcquirer(project.repoPath);
  const commitHash: string = await commitAcquirer.getRepoCurrentCommitHash();
  const projectWithMeta: ProjectWithMeta = {
    project,
    version: {
      commitHash
    }
  };

  const flowController = new FlowController(projectWithMeta.project.getSetting().flow, {
    repoPath: projectWithMeta.project.repoPath,
    std: true
  });

  flowController.start();
  flowController.flowResult$.subscribe(
    (flowResult: FlowResult) => {
      if (flowResult.status === 'FAILURE') {
        console.log();
        console.log(colors.red(`✗ Run failure`));
        console.log();
      }
    },
    null,
    () => {
      console.log('Haseo run complete!');
    }
  );
}

main();
