import axios from "axios";

import { Transaction } from "@/types/transaction";
import { DashboardSummary } from "@/types/dashboard";
import { TransactionDetail } from "@/types/transactionDetail";
import { ScannerAreaSummary } from "@/types/scannerArea";
import { ScannerStatus } from "@/types/scannerStatus";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://localhost:7299",
});

export async function getRecentTransactions(): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>(
    "/api/transactions/recent"
  );

  return response.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>(
    "/api/dashboard/summary"
  );

  return response.data;
}

export async function getSorterIds(): Promise<number[]> {
  const response = await api.get<number[]>(
    "/api/transactions/sorters"
  );

  return response.data;
}

export async function getTransactionDetail(
  id: number
): Promise<TransactionDetail> {
  const response = await api.get<TransactionDetail>(
    `/api/transactions/${id}`
  );

  return response.data;
}

export async function getScannerAreaSummary(
  slug: string
): Promise<ScannerAreaSummary> {
  const response = await api.get<ScannerAreaSummary>(
    `/api/scanner-areas/${slug}/summary`
  );

  return response.data;
}

export async function getScannerAreaTransactions(
  slug: string
): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>(
    `/api/scanner-areas/${slug}/transactions`
  );

  return response.data;
}

export async function getScannerAreaScanners(
  slug: string
): Promise<ScannerStatus[]> {
  const response = await api.get<ScannerStatus[]>(
    `/api/scanner-areas/${slug}/scanners`
  );

  return response.data;
}
