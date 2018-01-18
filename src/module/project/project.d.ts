declare interface ProjectBuildReport {
  id: number;
  projectName: string;
  isSuccess: boolean;
  flowsOutput: any[];
  startDate: number;
  flowErrorName?: string;
  newCommitDate?: string;
}
