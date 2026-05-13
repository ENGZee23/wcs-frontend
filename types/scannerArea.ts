import { DashboardSummary } from "./dashboard";

export type ScannerAreaSummary = DashboardSummary & {
  slug: string;
  title: string;
  subtitle: string;
  plc: string;
  msgType: "RTREQ";
  source: string;
  sorterIds: number[];
  finalSorterIds: number[];
};
