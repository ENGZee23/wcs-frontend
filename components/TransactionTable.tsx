"use client";

import { useState } from "react";

import { Transaction } from "@/types/transaction";
import { TransactionDetail } from "@/types/transactionDetail";

import { getTransactionDetail } from "@/lib/api";

import StatusBadge from "./StatusBadge";
import TransactionModal from "./TransactionModal";

type Props = {
  transactions: Transaction[];
  theme?: "dark" | "light";
};

function getRouteStatus(status: number | null) {
  switch (status) {
    case 10:
      return {
        text: "Route Found",
        color: "green" as const,
      };

    case 11:
      return {
        text: "No Route",
        color: "red" as const,
      };

    case 12:
      return {
        text: "Barcode Unknown",
        color: "yellow" as const,
      };

    default:
      return {
        text: "Pending",
        color: "gray" as const,
      };
  }
}

function getConfirmStatus(status: number | null) {
  switch (status) {
    case 0:
      return {
        text: "Confirmed",
        color: "green" as const,
      };

    case 1:
      return {
        text: "Failed",
        color: "red" as const,
      };

    default:
      return {
        text: "Waiting",
        color: "gray" as const,
      };
  }
}

function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function TransactionTable({
  transactions,
  theme = "dark",
}: Props) {
  const isDark = theme === "dark";
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetail | null>(null);

  async function openTransaction(id: number) {
    try {
      const detail = await getTransactionDetail(id);
      setSelectedTransaction(detail);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div
        className={`h-full overflow-auto rounded-lg border shadow-sm ${
          isDark
            ? "border-slate-800 bg-slate-950"
            : "border-slate-200 bg-white"
        }`}
      >
        <table className="min-w-full text-sm">
          <thead
            className={`sticky top-0 z-10 border-b text-xs uppercase shadow ${
              isDark
                ? "border-slate-800 bg-slate-900 text-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            <tr>
              <th className="px-4 py-3 text-left">MsgID</th>
              <th className="px-4 py-3 text-left">PLC</th>
              <th className="px-4 py-3 text-left">Sorter</th>
              <th className="px-4 py-3 text-left">SEQ</th>
              <th className="px-4 py-3 text-left">Barcode</th>
              <th className="px-4 py-3 text-left">Dest1</th>
              <th className="px-4 py-3 text-left">Dest2</th>
              <th className="px-4 py-3 text-left">Dest3</th>
              <th className="px-4 py-3 text-left">Dest4</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Confirm</th>
              <th className="px-4 py-3 text-left">Scan Time</th>
              <th className="px-4 py-3 text-left">Confirm Time</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => {
              const route = getRouteStatus(tx.routeStatus);
              const confirm = getConfirmStatus(tx.rtCnfStatus);

              return (
                <tr
                  key={tx.id}
                  onClick={() => openTransaction(tx.id)}
                  className={`cursor-pointer border-t ${
                    isDark
                      ? "border-slate-900 text-slate-300 hover:bg-slate-900"
                      : "border-slate-100 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-mono ${
                      isDark ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    {tx.msgID}
                  </td>
                  <td className="px-4 py-3">{tx.plcID}</td>
                  <td className="px-4 py-3">{tx.sorterID}</td>
                  <td className="px-4 py-3">{tx.seq}</td>
                  <td
                    className={`px-4 py-3 font-mono ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {tx.barcode}
                  </td>
                  <td className="px-4 py-3">{tx.dest1 ?? "-"}</td>
                  <td className="px-4 py-3">{tx.dest2 ?? "-"}</td>
                  <td className="px-4 py-3">{tx.dest3 ?? "-"}</td>
                  <td className="px-4 py-3">{tx.dest4 ?? "-"}</td>

                  <td className="px-4 py-3">
                    <StatusBadge text={route.text} color={route.color} />
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge text={confirm.text} color={confirm.color} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {formatTime(tx.scanTime)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {formatTime(tx.confirmTime)}
                  </td>
                </tr>
              );
            })}

            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        theme={theme}
      />
    </>
  );
}
