process.on('unhandledRejection', console.error);

import 'babel-polyfill';

import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'colors';
import * as meow from 'meow';
import { AppConsole } from '../util/console';
import { Application } from '../application/application';

// tslint:disable:no-console
async function main(): Promise<void> {
  const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString())
    .version;

  console.log(colors.green('➤'), ' Haseo cli version: ', colors.yellow(version));

  const cli = meow(`
    Useage
      $ haseo <options> 

    Options 
      --trigger, -t (MANUAL | GIT | SCHEDUE | ONCE)
      --server, start web server (it default disable single project mode)
  `, {
    flags: {
      trigger: {
        type: 'string'
      },
      server: {
        type: 'boolean'
      }
    }
  });

  console.log('cli.flags', cli.flags);

  const serverMode: boolean = cli.flags.server;

  if (serverMode) {
    AppConsole.log('Haseo run server mode:')
  }

  if (serverMode && fs.existsSync('haseo.yaml')) {
    AppConsole.log('Running in server mode, skip current path project.')
  }

  if (!fs.existsSync('haseo.yaml') && !serverMode) {
    AppConsole.log(
      colors.bold.red('Error: '),
      colors.red('Can not found `haseo.yaml`, please cd haseo configured project and retry.`')
    );
    return;
  }

  AppConsole.log();
  AppConsole.log();

  // const repoName = R.takeLast(1, path.resolve('.').split('/'));
  // const project = new Project('.', 'haseo.yaml');


  new Application().start({
    server: cli.flags.server,
    trigger: cli.flags.trigger
  });
  // runnerDaemon.teardown();

  // const commitAcquirer: CommitAcquirer = new CommitAcquirer(project.repoPath);
  // const commitHash: string = await commitAcquirer.getRepoCurrentCommitHash();
  
  // const flowController = new FlowController(projectWithMeta.project.getSetting().flow, {
  //   repoPath: projectWithMeta.project.repoPath,
  //   std: true
  // });


  // flowController.start();
  // flowController.flowResult$.subscribe(
  //   (flowResult: FlowResult) => {
  //     if (flowResult.status === 'FAILURE') {
  //       console.log();
  //       console.log(colors.red(`✗ Run failure`));
  //       console.log();
  //     }
  //   },
  //   null,
  //   () => {
  //     console.log('Haseo run complete!');
  //   }
  // );
}

main();
