export class FlowRunner {
  constructor(private flow: object) {}

  public run(flow: object) {
    const [flowName, flowCommand] = R.flatten([R.keys(flow), R.values(flow)]);

    const repoPath = this.repoPath;

    const cprocess = exec(flowCommand, {
      cwd: repoPath
    });

    cprocess.stdout.on('data', data => {
      const text = data
        .toString()
        .replace(/\u0008/g, '')
        .replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('FLOW_UNIT_MESSAGE_UPDATE', flowName, {
        type: 'stdout',
        text
      });
      if (this.options.stdout) {
        process.stdout.write(text);
      }
    });

    cprocess.stderr.on('data', data => {
      const text = data
        .toString()
        .replace(/\u0008/g, '')
        .replace(/\[[0-9;]*m/g, '');
      this.eventEmitter.emit('FLOW_UNIT_MESSAGE_UPDATE', flowName, {
        type: 'stderr',
        text
      });
      logger.info(text);
      this.options.stdout && process.stdout.write(text);
    });

    cprocess.on('close', code => {
      cprocess.kill();
      if (!!code) {
        this.eventEmitter.emit('FLOW_UNIT_FAILURE', flowName);
        this.failure();
      } else {
        this.eventEmitter.emit('FLOW_UNIT_SUCCESS', flowName);
        this.next(R.drop(1, flows));
      }
    });
  }
}
