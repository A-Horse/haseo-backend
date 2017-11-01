import R from 'ramda';

export default class ProjectStatus {
  constructor() {
    this.init();
  }

  init() {
    this.report = {
      // isPulling: false, // TODO state
      isSuccess: false,
      // currentFlowName: null,
      flowErrorName: null,
      flowsOutput: [],
      // successedFlow: [],
      newCommitDate: null,
      startDate: null
    };
  }

  replaceReport(report) {
    this.report = report;
  }

  getReport() {
    return this.report;
  }

  getReportBuildState() {
    return R.omit(['flowOutput'], this.report);
  }

  set(name, value) {
    this.report[name] = value;
  }

  get(name) {
    return this.report[name];
  }

  appendOutput(string) {
    this.report.output += string;
  }

  pushFlowOutput(flowName, flowOutput) {
    if ((R.last(this.report.flowsOutput) || {}).flowName !== flowName) {
      this.report.flowsOutput.push({ flowName: flowName, output: [flowOutput] });
    } else {
      R.last(this.report.flowsOutput).output.push(flowOutput);
    }
  }

  // pushSuccessedFlow(flowName) {
  //   this.report.successedFlow.push(flowName);
  // }
}
