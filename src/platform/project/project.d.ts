declare interface ProjectRunReportRow {
  id: number;
  projectName: string;
  startDate: string;
  commitHash: string;
  repoPullOutput: string;
  result: string;
  status: ReportStatus;
}
