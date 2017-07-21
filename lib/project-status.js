import R from 'ramda';

export default class PorjectStatus {
  constructor() {
    this.initStatus();
  }

  initStatus() {
    this.status = {
      // output: '',
      isRunning: false,
      isPulling: false,
      isSuccess: false,
      currentFlowName: null,
      flowErrorName: null,
      // errorOutput: '',
      flowsOutput: [],
      successedFlow: []
    };
  }

  setStatus(name, value) {
    this.status[name] = value;
  }

  getStatusObject() {
    return this.status;
  }

  appendOutput(string) {
    this.status.output += string;
  }

  pushFlowOutput(flowOutput) {
    this.status.flowsOutput.push(flowOutput);
  }

  pushSuccessedFlow(flowName) {
    this.status.successedFlow.push(flowName);
  }
}
