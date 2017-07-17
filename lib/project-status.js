
export default class PorjectStatus {
  constructor() {

  }

  initStatus() {
    this.output = '';
    this.isFail = false;
    this.flowErrorName = null;
    this.errOutput = null;
  }

  appendOutput(string) {
    this.output += string;
  }

  setFlowError(flowName, errOutput) {
    this.flowErrorName = flowName;
  }

}
