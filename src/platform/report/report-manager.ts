import {
  queryProjectLastRunReport,
  queryProjectRunReportHistory,
  queryProjectRunReport
} from '../../dao/report.dao';

export class ReportManager {
  public async getProjectLastRunReport(projectName: string): Promise<ProjectRunReportRow> {
    return await queryProjectLastRunReport(projectName);
  }

  public async getProjectRunReportHistory(
    projectName: string,
    limit: number,
    offset: number
  ): Promise<ProjectRunReportRow[]> {
    return await queryProjectRunReportHistory(projectName, limit, offset);
  }

  public async getProjectRunReport(
    projectName: string,
    reportId: number
  ): Promise<ProjectRunReportRow> {
    return await queryProjectRunReport(projectName, reportId);
  }
}
