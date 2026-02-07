import { cn } from "@/lib/utils"

interface GradeChipProps {
  grade: number | null
  size?: "sm" | "md"
}

function getGradeStyle(grade: number | null) {
  if (grade === null) return "bg-gray-100 text-scan-text3"
  if (grade >= 5) return "bg-green-100 text-green-800"
  if (grade >= 3) return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-0.5",
}

export function GradeChip({ grade, size = "md" }: GradeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium rounded-md",
        getGradeStyle(grade),
        sizeClasses[size]
      )}
    >
      {grade !== null ? grade : "IV"}
    </span>
  )
}
