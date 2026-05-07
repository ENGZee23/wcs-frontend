type Props = {
  text: string;
  color:
    | "green"
    | "red"
    | "yellow"
    | "blue"
    | "gray";
};

export default function StatusBadge({
  text,
  color,
}: Props) {
  const colorClasses = {
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    red: "bg-red-500/10 text-red-300 border-red-500/30",
    yellow: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    blue: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    gray: "bg-slate-700/40 text-slate-300 border-slate-600",
  };

  return (
    <div
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${colorClasses[color]}
      `}
    >
      {text}
    </div>
  );
}
