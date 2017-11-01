import knex from '../service/knex';
import logger from '../util/logger';

export default class ProjectDbHelper {
  constructor(project) {
    this.project = project;
  }

  async saveBuildReport() {
    try {
      await knex('project_build_report').insert({
        project_name: this.project.projectConfig.name,
        start_date: this.project.buildReport.get('startDate'),
        status_serialization: JSON.stringify(this.project.buildReport.getReport())
      });
      logger.info(`project build report save successful ${this.project.projectConfig.name}`);
    } catch (error) {
      logger.error(`project build report save error, ${error}`);
    }
  }

  async getLastBuildReport() {
    const project = this.project;
    try {
      const report = await knex('project_build_report')
        .select('*')
        .where('project_name', '=', project.projectConfig.name)
        .orderBy('start_date', 'desc')
        .limit(1);
      logger.info(`get project ${project.projectConfig.name} last build report success ${report}`);
      return report;
    } catch (error) {
      logger.error('get last project build report', error);
    }
  }

  async assignBuildReport() {
    try {
      const report = (await this.getLastBuildReport())[0];
      if (!report) {
        return;
      }
      const lastBuildReport = JSON.parse(report.status_serialization);
      this.project.buildReport.replaceReport(lastBuildReport);
    } catch (error) {
      console.error(error);
    }
  }

  async getReports(limit) {
    const project = this.project;
    try {
      const reports = await knex('project_build_report')
        .select('*')
        .where('project_name', '=', project.projectConfig.name)
        .orderBy('start_date', 'desc')
        .limit(limit);
      return reports;
    } catch (error) {
      logger.error(`get project report list error ${error}`);
    }
  }
}
