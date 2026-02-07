import { cn } from "@/lib/utils"

interface StatusDotProps {
  status: "ok" | "warn" | "crit"
  size?: "sm" | "md"
}

const statusColors = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  crit: "bg-status-crit",
}

const sizes = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
}

export function StatusDot({ status, size = "sm" }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full flex-shrink-0",
        statusColors[status],
        sizes[size]
      )}
    />
  )
}
