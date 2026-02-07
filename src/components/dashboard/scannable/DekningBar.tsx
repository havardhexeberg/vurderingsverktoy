import { cn } from "@/lib/utils"

interface DekningBarProps {
  assessed: number
  total: number
  showLabel?: boolean
}

function getBarColor(pct: number) {
  if (pct >= 70) return "bg-status-ok"
  if (pct >= 40) return "bg-status-warn"
  return "bg-status-crit"
}

export function DekningBar({ assessed, total, showLabel = true }: DekningBarProps) {
  const pct = total > 0 ? Math.round((assessed / total) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
        <div
          className={cn("h-full rounded-full transition-all", getBarColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-xs text-scan-text2 whitespace-nowrap">
          {assessed}/{total}
        </span>
      )}
    </div>
  )
}
