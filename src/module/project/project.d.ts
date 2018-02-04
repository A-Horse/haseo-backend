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

declare interface ProjectRunReportRow {
  id: number;
  project_name: string;
  start_date: string;
  commit_hash: string;
  repo_pull_output: string;
  result: string;
}

declare interface ProjectInfomation {
  name: string;
  flows: any[];
  status: any;
  report: ProjectBuildReport;
}
