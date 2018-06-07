declare interface OutputUnit {
  type: 'stdout' | 'stderr';
  data: string;
}

declare interface FlowOutputUnit {
  flowName: string;
  type: 'stdout' | 'stderr';
  data: string;
}

declare interface FlowResult {
  status: 'SUCCESS' | 'FAILURE';
  flowName: string;
  result: OutputUnit[];
  startTime: number;
  duration: number;
}
