import { TriggerType } from "../tirgger/triggered-project";

export declare interface ProjectRunReportRow {
  id: number;
  projectName: string;
  startDate: string;
  commitHash: string;
  repoPullOutput: string;
  result: string;
  status: ReportStatus;
}

export interface ProjectSetting {
  name: string;
  flow: object[];
  trigger: TriggerType;
  schedue?: string;
  useGit: boolean;
}
