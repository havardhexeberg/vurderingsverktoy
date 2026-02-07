"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Bell,
  FileUp,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"

const navigation = [
  { id: "oversikt", label: "Oversikt", href: "/rektor", icon: LayoutDashboard },
  { id: "larere", label: "Lærere", href: "/rektor/larere", icon: Users },
  { id: "elever", label: "Elever", href: "/rektor/elever", icon: GraduationCap },
  { id: "faggrupper", label: "Faggrupper", href: "/rektor/faggrupper", icon: BookOpen },
  { id: "vurderingspraksis", label: "Vurderingspraksis", href: "/rektor/vurderingspraksis", icon: BarChart3 },
  { id: "varsler", label: "Varsler", href: "/rektor/varsler", icon: Bell },
  { id: "import", label: "Import", href: "/rektor/import", icon: FileUp },
]

export function RektorSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    fetch("/api/rektor/alerts")
      .then((r) => r.ok ? r.json() : [])
      .then((alerts: Array<{ priority: string }>) => {
        setAlertCount(alerts.filter((a) => a.priority === "CRITICAL").length)
      })
      .catch(() => {})
  }, [])

  const checkActive = (item: typeof navigation[number]) => {
    if (item.href === "/rektor") return pathname === "/rektor"
    return pathname.startsWith(item.href)
  }

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-5 pb-5 border-b border-scan-border mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-scan-text tracking-tight">Vurdering</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rektor-light text-rektor border border-rektor-border">
            Rektor
          </span>
        </div>
        <div className="text-xs text-scan-text3 mt-1">{session?.user?.name || "Rektor"}</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-1">
        {navigation.map((item) => {
          const active = checkActive(item)
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-rektor-light text-scan-text font-semibold"
                  : "text-scan-text2 hover:bg-scan-bg"
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "opacity-100" : "opacity-50")} />
              <span className="flex-1">{item.label}</span>
              {item.id === "varsler" && alertCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[11px] font-semibold font-mono bg-status-crit text-white px-1">
                  {alertCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-scan-border">
        <div className="text-xs text-scan-text3 mb-2">Nordvik ungdomsskole</div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-scan-text3 hover:text-scan-text"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Logg ut
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-scan-border bg-scan-surface px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 text-scan-text2"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-scan-text">Rektorportal</span>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 bg-scan-surface border-r border-scan-border transform transition-transform md:hidden flex flex-col pt-5",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-4 text-scan-text3"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col bg-scan-surface border-r border-scan-border pt-5">
        <NavContent />
      </aside>
    </>
  )
}
