import * as R from 'ramda';
import knex from '../service/knex';
import { pipelineLogger } from '../util/logger';
import { ColumnInfo } from 'knex';
import Project from 'src/module/project/project';
import { FlowResult } from 'src/module/flow/flow.module';

const projectRunReportTableName = 'project_run_report';
export async function initProjectRunReport(payload: {
  projectName: string;
  startDate: number;
  commitHash: string;
  repoPullOuput: string;
}): Promise<{
  id: number;
}> {
  return await knex(projectRunReportTableName).insert({
    project_name: payload.projectName,
    start_date: payload.startDate,
    commit_hash: payload.commitHash,
    repo_pull_output: payload.repoPullOuput
  });
}

export async function saveProjectRunReport(
  columnId: number,
  payload: {
    result: FlowResult[];
    status: string;
  }
): Promise<void> {
  await knex(projectRunReportTableName)
    .where('id', '=', columnId)
    .update({
      result: payload.result,
      status: payload.status
    });
}

export async function getLastBuildReport(projectName: string): Promise<ProjectBuildReportRow> {
  const reportRows: ProjectBuildReportRow[] = await knex(projectRunReportTableName)
    .select('*')
    .where('project_name', '=', projectName)
    .orderBy('start_date', 'desc')
    .limit(1);

  return reportRows.length ? reportRows[0] : null;
}
