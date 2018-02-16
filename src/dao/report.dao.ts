import * as R from 'ramda';
import * as camelcaseKeys from 'camelcase-keys';
import knex from '../service/knex';
import { pipelineLogger } from '../util/logger';
import { ColumnInfo } from 'knex';
import { Project } from '../platform/project/project';

const projectRunReportTableName = 'project_run_report';

export async function initProjectRunReport(payload: {
  projectName: string;
  startDate: number;
  commitHash: string;
  repoPullOuput: string;
  status: string;
}): Promise<number> {
  return await knex(projectRunReportTableName).insert({
    project_name: payload.projectName,
    start_date: payload.startDate,
    commit_hash: payload.commitHash,
    repo_pull_output: payload.repoPullOuput,
    status: payload.status
  });
}

export async function saveProjectRunReport(
  reportId: number,
  payload: {
    result: FlowResult[];
    status: string;
  }
): Promise<void> {
  await knex(projectRunReportTableName)
    .where('id', '=', reportId.toString())
    .update({
      result: JSON.stringify(payload.result),
      status: payload.status
    });
}

export async function queryProjectLastRunReport(projectName: string): Promise<ProjectRunReportRow> {
  const reportRows: ProjectRunReportRow[] = await knex(projectRunReportTableName)
    .select('*')
    .where('project_name', '=', projectName)
    .orderBy('start_date', 'desc')
    .limit(1);
  if (!reportRows.length) {
    return null;
  }
  return camelcaseKeys({
    ...reportRows[0],
    result: JSON.parse(reportRows[0].result)
  });
}

export async function queryProjectRunReport(
  projectName: string,
  reportId: number
): Promise<ProjectRunReportRow> {
  const reportRows: ProjectRunReportRow[] = await knex(projectRunReportTableName)
    .select('*')
    .where('project_name', '=', projectName)
    .andWhere('id', '=', reportId);

  return reportRows.length ? reportRows[0] : null;
}

export async function queryProjectRunReportHistory(
  projectName: string,
  limit: number,
  offset: number
): Promise<ProjectRunReportRow[]> {
  return await knex(projectRunReportTableName)
    .select('*')
    .where('project_name', '=', projectName)
    .orderBy('start_date', 'desc')
    .offset(offset)
    .limit(limit);
}
