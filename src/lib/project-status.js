import R from 'ramda';

export default class ProjectStatus {
  constructor() {
    this.initStatus();
  }

  initStatus() {
    this.status = {
      isWaitting: false,
      isRunning: false,
      isPulling: false,
      isSuccess: false,
      currentFlowName: null,
      flowErrorName: null,
      flowsOutput: [],
      successedFlow: [],
      newCommitDate: null,
      startDate: null
    };
  }

  getStatus() {
    return this.status;
  }

  set(name, value) {
    this.status[name] = value;
  }

  get(name) {
    return this.status[name];
  }

  getObject() {
    return this.status;
  }

  appendOutput(string) {
    this.status.output += string;
  }

  pushFlowOutput(flowName, flowOutput) {
    if ((R.last(this.status.flowsOutput) || {}).flowName !== flowName) {
      this.status.flowsOutput.push({ flowName: flowName, output: [flowOutput] });
    } else {
      R.last(this.status.flowsOutput).output.push(flowOutput);
    }
  }

  pushSuccessedFlow(flowName) {
    this.status.successedFlow.push(flowName);
  }
}
