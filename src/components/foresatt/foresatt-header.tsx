"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, LogOut } from "lucide-react"

export function ForesattHeader() {
  const { data: session } = useSession()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/foresatt" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-600" />
          <span className="text-lg font-semibold">Foresattportal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-brand-100 text-brand-700 text-sm">
                {session?.user?.name ? getInitials(session.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">
              {session?.user?.name}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logg ut
          </Button>
        </div>
      </div>
    </header>
  )
}
