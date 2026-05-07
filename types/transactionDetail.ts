export type TransactionDetail = {
  id: number;
  msgID: number;
  plcID: number;
  sorterID: number;
  seq: number;

  barcode: string;
  workTicket: string;

  scanStatus: number | null;
  routeCount: number | null;
  routeStatus: number | null;

  dest1: number | null;
  dest2: number | null;
  dest3: number | null;
  dest4: number | null;

  requestedDest: number | null;
  actualDest: number | null;

  rtCnfStatus: number | null;
  reasonCode: number | null;

  scanTime: string | null;
  routeTime: string | null;
  confirmTime: string | null;

  rawRTREQ: string;
  rawRTRSP: string;
  rawRTCNF: string;
};