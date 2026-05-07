type Props = {
  title: string;
  value: string | number;
  tone?: "blue" | "green" | "yellow" | "red" | "slate";
};

export default function SummaryCard({
  title,
  value,
  tone = "slate",
}: Props) {
  const toneClasses = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    yellow: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
    slate: "border-slate-700 bg-slate-900 text-slate-300",
  };

  return (
    <div className="min-h-[92px] rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase text-slate-500">
          {title}
        </div>
        <div className={`h-2 w-2 rounded-full border ${toneClasses[tone]}`} />
      </div>

      <div className="mt-3 truncate text-2xl font-semibold text-white">
        {value}
      </div>
    </div>
  );
}
