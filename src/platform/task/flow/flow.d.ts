interface OutputUnit {
  type: 'stdout' | 'stderr';
  data: string;
}

interface FlowOutputUnit {
  flowName: string;
  type: 'stdout' | 'stderr';
  data: string;
}

interface FlowResult {
  status: 'SUCCESS' | 'FAILURE';
  flowName: string;
  result: OutputUnit[];
}
