export interface OutputUnit {
  type: 'stdout' | 'stderr';
  data: string;
}
