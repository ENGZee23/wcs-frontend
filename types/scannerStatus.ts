export type ScannerStatus = {
  sorterId: number;
  name: string;
  status: "Healthy" | "No Read" | "Route Issue" | "Idle" | "No Data";
  msgID: number | null;
  plcID: number | null;
  seq: number | null;
  barcode: string;
  scanStatus: number | null;
  routeStatus: number | null;
  scanTime: string | null;
  confirmTime: string | null;
  scanCount: number;
  noReadCount: number;
  routeIssueCount: number;
};
