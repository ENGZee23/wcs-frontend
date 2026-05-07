export type DashboardSummary = {
  totalTransactions: number;
  routeFound: number;
  routeIssues: number;
  waitingConfirm: number;
  confirmed: number;
  activeSorters: number;
  lastScanTime: string | null;

  transactionsPerMinute: number;
};