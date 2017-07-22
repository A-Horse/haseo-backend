import R from 'ramda';

export default class ProjectStatus {
  constructor() {
    this.initStatus();
  }

  initStatus() {
    this.status = {
      // output: '',
      isWaitting: false,
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

  getStatus(name) {
    return this.status[name];
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
