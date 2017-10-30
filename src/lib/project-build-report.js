import R from 'ramda';

export default class ProjectStatus {
  constructor() {
    this.initStatus();
  }

  initStatus() {
    this.status = {
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

  getReport() {
    return this.status;
  }

  set(name, value) {
    this.status[name] = value;
  }

  get(name) {
    return this.status[name];
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
