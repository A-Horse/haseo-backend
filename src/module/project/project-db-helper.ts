import * as R from 'ramda';
import knex from '../../service/knex';
import { pipelineLogger } from '../../util/logger';
import Project from './project';

export default class ProjectDbHelper {
  private project: Project;

  constructor(project) {
    this.project = project;
  }

  public async saveBuildReport(): Promise<void> {
    try {
      await knex('project_build_report').insert({
        project_name: this.project.projectConfig.name,
        start_date: this.project.buildReport.get('startDate'),
        report_serialization: JSON.stringify(this.project.buildReport.getReport())
      });
      pipelineLogger.info(
        `project build report save successful ${this.project.projectConfig.name}`
      );
    } catch (error) {
      pipelineLogger.error(`project build report save error, ${error}`);
    }
  }

  public async getLastBuildReport(): Promise<ProjectBuildReportRow> {
    const project = this.project;
    try {
      const reportRows: ProjectBuildReportRow[] = await knex('project_build_report')
        .select('*')
        .where('project_name', '=', project.projectConfig.name)
        .orderBy('start_date', 'desc')
        .limit(1);

      pipelineLogger.info(
        `get project ${project.projectConfig.name} last build report success ${reportRows}`
      );

      return reportRows.length ? reportRows[0] : null;
    } catch (error) {
      pipelineLogger.error('get last project build report', error);
      throw error;
    }
  }

  public async getLastBuildReportData(): Promise<ProjectBuildReportData | null> {
    const report = await this.getLastBuildReport();
    if (!report) return null;
    return JSON.parse(report.report_serialization);
  }

  public async getReportHistoryWithoutOutput(offset: number, limit: number): Promise<any[]> {
    return (await this.getReports(offset, limit)).map(report => {
      return R.omit(['flowsOutput'], report);
    });
  }

  public async getReport(reportId: string): Promise<any> {
    const reportRows = await knex('project_build_report')
      .select('*')
      .where('project_name', '=', this.project.projectConfig.name)
      .andWhere('id', '=', reportId)
      .map(this.parseReportRowToReport);
    return reportRows.length ? reportRows[0] : null;
  }

  async getReports(offset: number, limit: number) {
    const project = this.project;
    try {
      const reports = await knex('project_build_report')
        .select('*')
        .where('project_name', '=', project.projectConfig.name)
        .orderBy('start_date', 'desc')
        .offset(offset)
        .limit(limit);
      return reports.map(this.parseReportRowToReport);
    } catch (error) {
      pipelineLogger.error(`get project report list error ${error}`);
    }
  }

  private parseReportRowToReport(reportRow): ProjectBuildReport {
    return {
      ...JSON.parse(reportRow.report_serialization),
      id: reportRow.id,
      projectName: reportRow.project_name
    };
  }
}
