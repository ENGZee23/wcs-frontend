"use client";

import { TransactionDetail } from "@/types/transactionDetail";

type Props = {
  transaction: TransactionDetail | null;
  onClose: () => void;
  theme?: "dark" | "light";
};

export default function TransactionModal({
  transaction,
  onClose,
  theme = "dark",
}: Props) {
  if (!transaction) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6">
      <div
        className={`max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border p-6 shadow-2xl ${
          isDark
            ? "border-slate-700 bg-slate-900 text-slate-100"
            : "border-slate-200 bg-white text-slate-950"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Transaction Detail
          </h2>

          <button
            onClick={onClose}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-500"
          >
            Close
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Info label="MsgID" value={transaction.msgID} theme={theme} />
          <Info label="PLC" value={transaction.plcID} theme={theme} />
          <Info label="Sorter" value={transaction.sorterID} theme={theme} />
          <Info label="SEQ" value={transaction.seq} theme={theme} />
          <Info label="Barcode" value={transaction.barcode} theme={theme} />
          <Info label="Dest1" value={transaction.dest1} theme={theme} />
          <Info label="Dest2" value={transaction.dest2} theme={theme} />
          <Info
            label="Actual Dest"
            value={transaction.actualDest}
            theme={theme}
          />
        </div>

        <RawBlock
          title="Raw RTREQ"
          value={transaction.rawRTREQ}
          theme={theme}
        />

        <RawBlock
          title="Raw RTRSP"
          value={transaction.rawRTRSP}
          theme={theme}
        />

        <RawBlock
          title="Raw RTCNF"
          value={transaction.rawRTCNF}
          theme={theme}
        />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  theme,
}: {
  label: string;
  value: unknown;
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-lg border p-3 ${
        isDark
          ? "border-slate-700 bg-slate-800"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-lg font-semibold">
        {value?.toString() || "-"}
      </div>
    </div>
  );
}

function RawBlock({
  title,
  value,
  theme,
}: {
  title: string;
  value: string;
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";

  return (
    <div className="mb-4">
      <div
        className={`mb-2 text-sm font-semibold ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {title}
      </div>

      <div
        className={`overflow-x-auto rounded-lg border p-4 font-mono text-sm ${
          isDark
            ? "border-slate-700 bg-black text-emerald-300"
            : "border-slate-200 bg-slate-950 text-emerald-300"
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}
