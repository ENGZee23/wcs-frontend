"use client";

import { TransactionDetail } from "@/types/transactionDetail";

type Props = {
  transaction: TransactionDetail | null;
  onClose: () => void;
};

export default function TransactionModal({
  transaction,
  onClose,
}: Props) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl">
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
          <Info label="MsgID" value={transaction.msgID} />
          <Info label="PLC" value={transaction.plcID} />
          <Info label="Sorter" value={transaction.sorterID} />
          <Info label="SEQ" value={transaction.seq} />
          <Info label="Barcode" value={transaction.barcode} />
          <Info label="Dest1" value={transaction.dest1} />
          <Info label="Dest2" value={transaction.dest2} />
          <Info label="Actual Dest" value={transaction.actualDest} />
        </div>

        <RawBlock
          title="Raw RTREQ"
          value={transaction.rawRTREQ}
        />

        <RawBlock
          title="Raw RTRSP"
          value={transaction.rawRTRSP}
        />

        <RawBlock
          title="Raw RTCNF"
          value={transaction.rawRTCNF}
        />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
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
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm font-semibold text-slate-300">
        {title}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700 bg-black p-4 font-mono text-sm text-emerald-300">
        {value || "-"}
      </div>
    </div>
  );
}
