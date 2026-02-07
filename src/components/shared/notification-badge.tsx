interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
      {count > 99 ? "99+" : count}
    </span>
  )
}
