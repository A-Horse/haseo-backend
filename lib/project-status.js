export default class PorjectStatus {
  constructor() {
    this.initStatus();
  }

  initStatus() {
    this.status = {
      output: '',
      isRunning: false,
      isPulling: false,
      isFail: false,
      flowErrorName: null
    };
  }

  toJSON() {
    return this.status;
  }

  appendOutput(string) {
    this.output += string;
  }

  setFlowError(flowName, errOutput) {
    this.flowErrorName = flowName;
  }
}
