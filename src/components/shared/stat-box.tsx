import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"

interface StatBoxProps {
  title: string
  value: string | number
  icon: LucideIcon
  href?: string
  className?: string
}

export function StatBox({ title, value, icon: Icon, href, className }: StatBoxProps) {
  const content = (
    <Card className={`${href ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
