export interface OutputUnit {
  type: 'stdout' | 'stderr';
  data: string;
}

export interface FlowResult {
  status: 'SUCCESS' | 'FAILURE';
  flow: object;
  result: OutputUnit[];
}
