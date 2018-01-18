declare interface ProjectBuildReportData {
  isSuccess: boolean;
  flowsOutput: any[];
  startDate: number;
  flowErrorName?: string;
  newCommitDate?: string;
}

declare interface ProjectBuildReport extends ProjectBuildReportData {
  id: number;
  projectName: string;
}

declare interface ProjectBuildReportRow {
  id: number;
  project_name: string;
  start_date: string | number;
  report_serialization: string;
}
