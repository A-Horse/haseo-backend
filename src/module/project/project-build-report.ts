// import * as R from 'ramda';

// export default class ProjectStatus {
//   private report: ProjectBuildReportData;

//   constructor() {
//     this.initReportData();
//   }

//   public initReportData(): void {
//     this.report = {
//       isSuccess: false,
//       flowErrorName: null,
//       flowsOutput: [],
//       newCommitDate: null,
//       startDate: null
//     };
//   }

//   public replaceReport(report: ProjectBuildReportData) {
//     this.report = report;
//   }

//   public getReport(): ProjectBuildReportData {
//     return this.report;
//   }

//   public getReportBuildState() {
//     return R.omit(['flowsOutput'], this.report);
//   }

//   public set(name: string, value): void {
//     this.report[name] = value;
//   }

//   public get(name): any {
//     return this.report[name];
//   }

//   public pushFlowOutput(flowName, flowOutput) {
//     if ((R.last(this.report.flowsOutput) || {}).flowName !== flowName) {
//       this.report.flowsOutput.push({ flowName, output: [flowOutput] });
//     } else {
//       R.last(this.report.flowsOutput).output.push(flowOutput);
//     }
//   }
// }
