"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  LogOut,
  Moon,
  Search,
  Server,
  ShieldCheck,
  Sun,
  X,
  HeartPulse,
  ArrowRight,
  Boxes,
  Cpu,
  Printer,
  Radio,
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import TransactionTable from "@/components/TransactionTable";

import {
  getRecentTransactions,
  getDashboardSummary,
} from "@/lib/api";

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
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [liveStatus, setLiveStatus] = useState("Connecting");
  const [heartbeatPulse, setHeartbeatPulse] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("wcs-dashboard-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("wcs-dashboard-theme", theme);
  }, [theme]);

  useEffect(() => {
    let isActive = true;
    const connection = createTransactionConnection();

    async function loadDashboard() {
      try {
        const summaryData = await getDashboardSummary();

        if (!isActive) return;

        setSummary(summaryData);
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
      (event: TransactionUpdatedEvent) => {
        if (event.messageType === "HBEAT") {
          setHeartbeatPulse((value) => value + 1);
          setLastHeartbeat(new Date(event.updatedAt).toLocaleTimeString());
          return;
        }

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

  function handleSignOut() {
    signOut();
    router.replace("/signin");
  }

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
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-400"
                    : "border-slate-300 bg-slate-50 text-slate-600"
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                Socket Protocol
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${liveStatusColor(liveStatus)}`}
              >
                <Activity className="h-3.5 w-3.5" />
                {liveStatus}
              </span>
              <span
                key={heartbeatPulse}
                className={`heartbeat-pill inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                  lastHeartbeat
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}
                title={
                  lastHeartbeat
                    ? `Last heartbeat ${lastHeartbeat}`
                    : "Waiting for heartbeat"
                }
              >
                <span className="heartbeat-icon-wrap">
                  <HeartPulse className="heartbeat-icon h-3.5 w-3.5" />
                  <span className="heartbeat-wave" />
                </span>
                HBEAT {lastHeartbeat || "Waiting"}
              </span>
              <Link
                href="/dashboard/scanners/level-1"
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                  isDark
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-700"
                }`}
              >
                Level 1
              </Link>
            </div>

            <h1 className="text-3xl font-semibold">
              WCS Operations Dashboard
            </h1>

            <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Plant-level health, scanner areas, sorter views, and print-apply operations
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? "Light" : "Dark"}
            </button>

            <button
              onClick={handleSignOut}
              className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          Overview updated {lastUpdated || "-"}
        </div>
      </div>

      <div className="h-[calc(100vh-230px)] overflow-auto p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div
            className={`rounded-xl border p-10 text-center ${
              isDark
                ? "border-slate-800 bg-slate-900 text-slate-400"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            Loading dashboard...
          </div>
        ) : (
          <div className="space-y-5">
            <section
              className={`rounded-lg border p-5 ${
                isDark
                  ? "border-slate-800 bg-slate-900/60"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">System Overview</h2>
                  <p
                    className={`mt-1 text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    PLC connections, heartbeat, scanner areas, sorters, and print-apply cells
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                  <OverviewMiniStat
                    label="Live Areas"
                    value="1"
                    isDark={isDark}
                  />
                  <OverviewMiniStat
                    label="Planned Areas"
                    value="5"
                    isDark={isDark}
                  />
                  <OverviewMiniStat
                    label="HBEAT"
                    value={lastHeartbeat || "Waiting"}
                    isDark={isDark}
                  />
                  <OverviewMiniStat
                    label="Mode"
                    value={isDark ? "Dark" : "Light"}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <SystemGroupCard
                  icon={<Radio className="h-5 w-5" />}
                  title="Scanner Areas"
                  live="Level 1"
                  planned="Level 2, VAS, Shipping, Distribution, ASRS"
                  isDark={isDark}
                />
                <SystemGroupCard
                  icon={<Boxes className="h-5 w-5" />}
                  title="Sorters"
                  live="Pending"
                  planned="Induction, VAS Packing, Shipping"
                  isDark={isDark}
                />
                <SystemGroupCard
                  icon={<Printer className="h-5 w-5" />}
                  title="Print Apply"
                  live="Pending"
                  planned="Induction printers, Shipping printers"
                  isDark={isDark}
                />
                <SystemGroupCard
                  icon={<Cpu className="h-5 w-5" />}
                  title="PLC Ports"
                  live="PLC_1"
                  planned="PLC_2, PLC_3, PLC_4"
                  isDark={isDark}
                />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Dashboards</h2>
                  <p
                    className={`mt-1 text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Open a focused operations view
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                <DashboardAreaCard
                  title="Pick to Light - Level 1"
                  subtitle="LUM1 / LUM2 scanner area"
                  status="Live"
                  details="RTREQ | Active test ID 1 | Final IDs 2, 3, 11-18"
                  href="/dashboard/scanners/level-1"
                  isDark={isDark}
                />
                <DashboardAreaCard
                  title="Pick to Light - Level 2"
                  subtitle="LUM3 / LUM4 scanner area"
                  status="Planned"
                  details="RTREQ | IDs 4, 5, 21-28"
                  href="/dashboard/scanners/level-2"
                  isDark={isDark}
                />
                <DashboardAreaCard
                  title="VAS / I-Pack Lidders"
                  subtitle="Product type and lid height decisions"
                  status="Planned"
                  details="RTREQ | IDs 61, 62, 63"
                  href="/dashboard/scanners/vas"
                  isDark={isDark}
                />
                <DashboardAreaCard
                  title="Shipping Scanners"
                  subtitle="Shipping scanner traffic"
                  status="Planned"
                  details="RTREQ | IDs 51, 52, 53"
                  href="/dashboard/scanners/shipping"
                  isDark={isDark}
                />
                <DashboardAreaCard
                  title="Shipping Sorter"
                  subtitle="Shipping sorter induction and diverts"
                  status="Planned"
                  details="Sorter view | IDs 50-53"
                  href="/dashboard/sorters/shipping"
                  isDark={isDark}
                />
                <DashboardAreaCard
                  title="Print Apply"
                  subtitle="Induction and shipping printer cells"
                  status="Planned"
                  details="PNREQ / PNRSP / PNCNF"
                  href="/dashboard/print-apply"
                  isDark={isDark}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function OverviewMiniStat({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        isDark
          ? "border-slate-800 bg-slate-950/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}

function SystemGroupCard({
  icon,
  title,
  live,
  planned,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  live: string;
  planned: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isDark
          ? "border-slate-800 bg-slate-950/50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-md border ${
            isDark
              ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
              : "border-blue-500/30 bg-blue-500/10 text-blue-700"
          }`}
        >
          {icon}
        </span>
        {title}
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-500">Live: </span>
          <span>{live}</span>
        </div>
        <div>
          <span className="text-slate-500">Planned: </span>
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>
            {planned}
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardAreaCard({
  title,
  subtitle,
  status,
  details,
  href,
  isDark,
}: {
  title: string;
  subtitle: string;
  status: "Live" | "Planned";
  details: string;
  href: string;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-lg border p-5 shadow-sm transition ${
        isDark
          ? "border-slate-800 bg-slate-900/80 hover:border-blue-500/40"
          : "border-slate-200 bg-white hover:border-blue-400"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {subtitle}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${
            status === "Live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : isDark
                ? "border-slate-700 bg-slate-800 text-slate-400"
                : "border-slate-300 bg-slate-100 text-slate-500"
          }`}
        >
          {status}
        </span>
      </div>

      <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {details}
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-500">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
