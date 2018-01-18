import * as R from 'ramda';

export default class ProjectStatus {
  report: ProjectBuildReportData;
 
  constructor() {
    this.initReportData();
  }

  public initReportData(): void {
    this.report = {
      isSuccess: false,
      flowErrorName: null,
      flowsOutput: [],
      newCommitDate: null,
      startDate: null
    };
  }

  replaceReport(report: ProjectBuildReportData) {
    this.report = report;
  }

  public getReport(): ProjectBuildReportData {
    return this.report;
  }

  getReportBuildState() {
    return R.omit(['flowsOutput'], this.report);
  }

  set(name: string, value): void {
    this.report[name] = value;
  }

  get(name): any {
    return this.report[name];
  }

  pushFlowOutput(flowName, flowOutput) {
    if ((R.last(this.report.flowsOutput) || {}).flowName !== flowName) {
      this.report.flowsOutput.push({ flowName: flowName, output: [flowOutput] });
    } else {
      R.last(this.report.flowsOutput).output.push(flowOutput);
    }
  }
}
