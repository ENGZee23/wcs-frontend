"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Database,
  Layers,
  Radio,
  Search,
  Server,
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import SummaryCard from "@/components/SummaryCard";
import TransactionTable from "@/components/TransactionTable";
import {
  getScannerAreaSummary,
  getScannerAreaScanners,
  getScannerAreaTransactions,
} from "@/lib/api";
import { getScannerArea } from "@/lib/scannerAreas";
import { createTransactionConnection } from "@/lib/realtime";
import { ScannerAreaSummary } from "@/types/scannerArea";
import { ScannerStatus } from "@/types/scannerStatus";
import { Transaction } from "@/types/transaction";

function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function ScannerAreaContent() {
  const params = useParams<{ area: string }>();
  const areaSlug = params.area;
  const areaConfig = getScannerArea(areaSlug);

  if (!areaConfig) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-950">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Scanner area not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested scanner dashboard is not configured yet.
          </p>
          <Link
            href="/dashboard/scanners/level-1"
            className="mt-5 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Open Level 1
          </Link>
        </div>
      </main>
    );
  }

  const [summary, setSummary] = useState<ScannerAreaSummary | null>(null);
  const [scanners, setScanners] = useState<ScannerStatus[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("wcs-dashboard-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    const connection = createTransactionConnection();

    async function loadArea() {
      try {
        const [summaryData, scannerData, transactionData] = await Promise.all([
          getScannerAreaSummary(areaSlug),
          getScannerAreaScanners(areaSlug),
          getScannerAreaTransactions(areaSlug),
        ]);

        if (!isActive) return;

        setSummary(summaryData);
        setScanners(scannerData);
        setTransactions(transactionData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError("");
      } catch (err) {
        if (!isActive) return;
        setError(
          err instanceof Error ? err.message : "Failed to load scanner area"
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    const refreshArea = () => {
      void loadArea();
    };

    connection.on("TransactionUpdated", (event) => {
      if (event.messageType !== "HBEAT") {
        refreshArea();
      }
    });

    void connection.start().catch(() => undefined);

    const initialLoad = setTimeout(refreshArea, 0);
    const timer = setInterval(refreshArea, 30000);

    return () => {
      isActive = false;
      clearTimeout(initialLoad);
      clearInterval(timer);
      connection.off("TransactionUpdated");
      void connection.stop();
    };
  }, [areaSlug]);

  const filteredTransactions = transactions.filter((tx) => {
    const search = searchText.trim().toLowerCase();

    return (
      search === "" ||
      tx.barcode.toLowerCase().includes(search) ||
      tx.seq.toString().includes(search) ||
      tx.msgID.toString().includes(search) ||
      tx.sorterID.toString().includes(search)
    );
  });

  return (
    <main
      className={`h-screen overflow-hidden ${
        isDark ? "bg-[#080c14] text-slate-100" : "bg-slate-100 text-slate-950"
      }`}
    >
      <div
        className={`sticky top-0 z-20 border-b px-5 py-4 ${
          isDark
            ? "border-slate-800 bg-[#080c14]/95"
            : "border-slate-200 bg-white/95"
        }`}
      >
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/overview"
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Overview
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                <Radio className="h-3.5 w-3.5" />
                Scanner Area
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-400"
                    : "border-slate-300 bg-slate-50 text-slate-600"
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                {areaConfig.plc}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                <Activity className="h-3.5 w-3.5" />
                {areaConfig.msgType}
              </span>
            </div>

            <h1 className="text-3xl font-semibold">{areaConfig.title}</h1>
            <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {areaConfig.subtitle}
            </p>
          </div>

          <div
            className={`grid gap-2 text-sm sm:grid-cols-3 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 font-semibold ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <Layers className="h-4 w-4 text-slate-500" />
                Active IDs
              </div>
              <div className="mt-1 font-mono text-xs">
                {areaConfig.sorterIds.join(", ")}
              </div>
            </div>
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 font-semibold ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <Layers className="h-4 w-4 text-slate-500" />
                Final IDs
              </div>
              <div className="mt-1 font-mono text-xs">
                {areaConfig.finalSorterIds.join(", ")}
              </div>
            </div>
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 font-semibold ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <Database className="h-4 w-4 text-slate-500" />
                Source
              </div>
              <div className="mt-1 font-mono text-xs">{areaConfig.source}</div>
            </div>
          </div>
        </div>

        {summary && (
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            <SummaryCard
              title="Area Transactions"
              value={summary.totalTransactions}
              tone="blue"
              theme={theme}
            />
            <SummaryCard
              title="Route Found"
              value={summary.routeFound}
              tone="green"
              theme={theme}
            />
            <SummaryCard
              title="Route Issues"
              value={summary.routeIssues}
              tone={summary.routeIssues > 0 ? "red" : "slate"}
              theme={theme}
            />
            <SummaryCard
              title="Waiting Confirm"
              value={summary.waitingConfirm}
              tone={summary.waitingConfirm > 0 ? "yellow" : "slate"}
              theme={theme}
            />
            <SummaryCard
              title="Confirmed"
              value={summary.confirmed}
              tone="green"
              theme={theme}
            />
            <SummaryCard
              title="Transactions / Min"
              value={summary.transactionsPerMinute}
              tone="blue"
              theme={theme}
            />
            <SummaryCard
              title="Last Scan"
              value={formatTime(summary.lastScanTime)}
              tone="slate"
              theme={theme}
            />
          </div>
        )}

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-sm text-slate-500">
            Updated {lastUpdated || "-"}
          </div>

          <div
            className={`flex items-center gap-2 rounded-md border px-3 py-2 focus-within:border-blue-500 ${
              isDark
                ? "border-slate-700 bg-slate-900"
                : "border-slate-300 bg-white"
            }`}
          >
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search barcode, SEQ, MsgID, or sorter..."
              className={`w-full min-w-[320px] bg-transparent text-sm outline-none placeholder:text-slate-500 ${
                isDark ? "text-slate-100" : "text-slate-950"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-310px)] overflow-auto p-5">
        {error && (
          <div
            className={`mb-4 rounded-lg border border-red-500/30 p-4 ${
              isDark ? "bg-red-950/30 text-red-300" : "bg-red-50 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            className={`rounded-lg border p-10 text-center ${
              isDark
                ? "border-slate-800 bg-slate-900 text-slate-400"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            Loading scanner area...
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {scanners.map((scanner) => (
                <ScannerTile
                  key={scanner.sorterId}
                  scanner={scanner}
                  isDark={isDark}
                />
              ))}
            </div>

            <div className="h-[520px] overflow-hidden">
              <TransactionTable
                transactions={filteredTransactions}
                theme={theme}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ScannerTile({
  scanner,
  isDark,
}: {
  scanner: ScannerStatus;
  isDark: boolean;
}) {
  const statusClass = {
    Healthy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    "No Read": "border-amber-500/30 bg-amber-500/10 text-amber-400",
    "Route Issue": "border-red-500/30 bg-red-500/10 text-red-400",
    Idle: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    "No Data": "border-slate-500/30 bg-slate-500/10 text-slate-400",
  }[scanner.status];

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        isDark
          ? "border-slate-800 bg-slate-900/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{scanner.name}</div>
          <div className="mt-1 font-mono text-xs text-slate-500">
            SORTER_ID {scanner.sorterId}
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusClass}`}
        >
          {scanner.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <TileField
          label="Last Barcode"
          value={scanner.barcode || "-"}
          mono
          isDark={isDark}
        />
        <TileField
          label="Last Scan"
          value={formatTime(scanner.scanTime)}
          isDark={isDark}
        />
        <TileField
          label="Scan Count"
          value={scanner.scanCount}
          isDark={isDark}
        />
        <TileField
          label="No Reads"
          value={scanner.noReadCount}
          isDark={isDark}
        />
        <TileField
          label="Route Issues"
          value={scanner.routeIssueCount}
          isDark={isDark}
        />
        <TileField
          label="MsgID"
          value={scanner.msgID ?? "-"}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

function TileField({
  label,
  value,
  mono = false,
  isDark,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  isDark: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </div>
      <div
        className={`mt-1 truncate text-sm ${
          mono ? "font-mono" : ""
        } ${isDark ? "text-slate-100" : "text-slate-950"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function ScannerAreaPage() {
  return (
    <AuthGuard>
      <ScannerAreaContent />
    </AuthGuard>
  );
}
