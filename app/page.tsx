"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  LogOut,
  Search,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import TransactionTable from "@/components/TransactionTable";
import SummaryCard from "@/components/SummaryCard";

import {
  getRecentTransactions,
  getDashboardSummary,
  getSorterIds,
} from "@/lib/api";

import { Transaction } from "@/types/transaction";
import { DashboardSummary } from "@/types/dashboard";
import {
  createTransactionConnection,
  TransactionUpdatedEvent,
} from "@/lib/realtime";
import { signOut } from "@/lib/auth";

function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function confirmText(status: number | null) {
  if (status === 0) return "Confirmed";
  if (status === 1) return "Failed";
  return "Waiting";
}

function confirmColor(status: number | null) {
  if (status === 0) return "text-green-400";
  if (status === 1) return "text-red-400";
  return "text-yellow-400";
}

function liveStatusColor(status: string) {
  if (status === "Live") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "Reconnecting") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
  if (status === "Polling") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
  if (status === "Offline") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }
  return "border-slate-700 bg-slate-900 text-slate-300";
}

function DashboardContent() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sorterIds, setSorterIds] = useState<number[]>([]);
  const [selectedSorter, setSelectedSorter] = useState<number | "ALL">("ALL");
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [liveStatus, setLiveStatus] = useState("Connecting");

  useEffect(() => {
    let isActive = true;
    const connection = createTransactionConnection();

    async function loadDashboard() {
      try {
        const [txData, summaryData, sorterData] = await Promise.all([
          getRecentTransactions(),
          getDashboardSummary(),
          getSorterIds(),
        ]);

        if (!isActive) return;

        setTransactions(txData);
        setSummary(summaryData);
        setSorterIds(sorterData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError("");
      } catch (err) {
        if (!isActive) return;

        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    const refreshDashboard = () => {
      void loadDashboard();
    };

    connection.on(
      "TransactionUpdated",
      (_event: TransactionUpdatedEvent) => {
        refreshDashboard();
      }
    );

    connection.onreconnecting(() => {
      if (isActive) {
        setLiveStatus("Reconnecting");
      }
    });

    connection.onreconnected(() => {
      if (isActive) {
        setLiveStatus("Live");
        refreshDashboard();
      }
    });

    connection.onclose(() => {
      if (isActive) {
        setLiveStatus("Offline");
      }
    });

    void connection
      .start()
      .then(() => {
        if (isActive) {
          setLiveStatus("Live");
        }
      })
      .catch(() => {
        if (isActive) {
          setLiveStatus("Polling");
        }
      });

    const initialLoad = setTimeout(refreshDashboard, 0);
    const timer = setInterval(refreshDashboard, 30000);

    return () => {
      isActive = false;
      clearTimeout(initialLoad);
      clearInterval(timer);
      connection.off("TransactionUpdated");
      void connection.stop();
    };
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const sorterMatch =
      selectedSorter === "ALL" || tx.sorterID === selectedSorter;

    const search = searchText.trim().toLowerCase();

    const searchMatch =
      search === "" ||
      tx.barcode.toLowerCase().includes(search) ||
      tx.seq.toString().includes(search) ||
      tx.msgID.toString().includes(search);

    return sorterMatch && searchMatch;
  });

  const lastTransaction = transactions[0];

  function handleSignOut() {
    signOut();
    router.replace("/signin");
  }

  return (
    <main className="h-screen overflow-hidden bg-[#080c14] text-slate-100">
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-[#080c14]/95 px-5 py-4">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-slate-400">
                <Server className="h-3.5 w-3.5" />
                Socket Protocol
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${liveStatusColor(liveStatus)}`}
              >
                <Activity className="h-3.5 w-3.5" />
                {liveStatus}
              </span>
            </div>

            <h1 className="text-3xl font-semibold">WCS Operations Dashboard</h1>

            <p className="mt-2 text-slate-400">
              Live routing, confirmation, and sorter transaction visibility
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {summary && (
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            <SummaryCard
              title="Total Transactions"
              value={summary.totalTransactions}
              tone="blue"
            />

            <SummaryCard
              title="Route Found"
              value={summary.routeFound}
              tone="green"
            />

            <SummaryCard
              title="Route Issues"
              value={summary.routeIssues}
              tone={summary.routeIssues > 0 ? "red" : "slate"}
            />

            <SummaryCard
              title="Waiting Confirm"
              value={summary.waitingConfirm}
              tone={summary.waitingConfirm > 0 ? "yellow" : "slate"}
            />

            <SummaryCard
              title="Confirmed"
              value={summary.confirmed}
              tone="green"
            />
            <SummaryCard
              title="Transactions / Min"
              value={summary.transactionsPerMinute}
              tone="blue"
            />

            <SummaryCard
              title="Last Scan"
              value={formatTime(summary.lastScanTime)}
              tone="slate"
            />
          </div>
        )}

        <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Clock className="h-4 w-4 text-slate-500" />
              Last Transaction
            </div>
            <div className="text-xs text-slate-500">
              Updated {lastUpdated || "-"}
            </div>
          </div>

          {lastTransaction ? (
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="text-slate-500">Barcode: </span>
                <span className="font-mono text-white">
                  {lastTransaction.barcode}
                </span>
              </div>

              <div>
                <span className="text-slate-500">SEQ: </span>
                <span className="text-white">{lastTransaction.seq}</span>
              </div>

              <div>
                <span className="text-slate-500">Sorter: </span>
                <span className="text-white">{lastTransaction.sorterID}</span>
              </div>

              <div>
                <span className="text-slate-500">Confirm: </span>
                <span className={confirmColor(lastTransaction.rtCnfStatus)}>
                  {confirmText(lastTransaction.rtCnfStatus)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No transactions yet</div>
          )}
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSorter("ALL")}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                selectedSorter === "ALL"
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              All
            </button>

            {sorterIds.map((sorterId) => (
              <button
                key={sorterId}
                onClick={() => setSelectedSorter(sorterId)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                  selectedSorter === sorterId
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Sorter {sorterId}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus-within:border-blue-500">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search barcode, SEQ, or MsgID..."
              className="w-full min-w-[280px] bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />

            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </div>
      </div>

      <div className="h-[calc(100vh-360px)] overflow-hidden p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading dashboard...
          </div>
        ) : (
          <TransactionTable transactions={filteredTransactions} />
        )}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
