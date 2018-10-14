import * as R from 'ramda';
import * as camelcaseKeys from 'camelcase-keys';
import knex from '../service/knex';
import { pipelineLogger } from '../util/logger';
import { ColumnInfo } from 'knex';
import { Project } from '../platform/project/project';

const projectRunReportTableName = 'project_run_report';

function transformReportRow(row): ProjectRunReportRow {
  return camelcaseKeys({
    ...row,
    result: JSON.parse(row.result)
  });
}

export async function initProjectRunReport(payload: {
  projectName: string;
  startDate: number;
  commitHash?: string;
  repoPullOuput: string;
  status: string;
}): Promise<number> {
  return (await knex(projectRunReportTableName).insert({
    project_name: payload.projectName,
    start_date: payload.startDate,
    commit_hash: payload.commitHash,
    repo_pull_output: payload.repoPullOuput,
    status: payload.status
  }))[0];
}

export async function saveProjectRunReport(
  reportId: number,
  payload: {
    result: FlowResult[];
    status: string;
    flows: any[]
  }
): Promise<void> {
  await knex(projectRunReportTableName)
    .where('id', '=', reportId.toString())
    .update({
      result: JSON.stringify(payload.result),
      status: payload.status,
      flows: JSON.stringify(payload.flows)
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

  return transformReportRow(reportRows[0]);
}

export async function queryProjectRunReport(reportId: number): Promise<ProjectRunReportRow> {
  let reportRows: ProjectRunReportRow[] = [];
  try {
    reportRows = await knex(projectRunReportTableName)
      .select('*')
      .where('id', '=', reportId);
  } catch (error) {
    // tslint:disable-next-line
    console.error(error);
  }

  if (!reportRows.length) {
    return null;
  }

  return transformReportRow(reportRows[0]);
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
    .limit(limit)
    .map(transformReportRow);
}
