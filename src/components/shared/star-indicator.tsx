import { Star } from "lucide-react"

interface StarIndicatorProps {
  lastAssessmentDate: string | null
}

export function StarIndicator({ lastAssessmentDate }: StarIndicatorProps) {
  if (!lastAssessmentDate) {
    return <span className="text-sm text-gray-500">IV</span>
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastAssessmentDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSince <= 365) {
    return <Star className="h-5 w-5 text-green-500 fill-green-500" />
  }

  return <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
}
