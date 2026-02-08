"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Home, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

interface ChildInfo {
  id: string
  name: string
  grade: number
  fagDekning: Record<string, { antallVurderinger: number }>
}

export function ForesattSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [children, setChildren] = useState<ChildInfo[]>([])

  useEffect(() => {
    fetch("/api/foresatt/children")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ChildInfo[]) => setChildren(data))
      .catch(() => {})
  }, [])

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const activeChildId = pathname.match(/\/foresatt\/barn\/([^/?]+)/)?.[1] || null

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-scan-border">
        <Link href="/foresatt" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <div className="text-[15px] font-semibold text-scan-text tracking-tight">Vurdering</div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-foresatt-light text-foresatt border border-foresatt-border">
            Foresatt
          </span>
        </Link>
        <button className="md:hidden p-1 text-scan-text3 hover:text-scan-text" onClick={() => setMobileMenuOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-3">
        <Link
          href="/foresatt"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-1 ${
            pathname === "/foresatt"
              ? "bg-foresatt-light text-foresatt"
              : "text-scan-text2 hover:text-scan-text hover:bg-scan-bg"
          }`}
        >
          <Home className="h-4 w-4" />
          Oversikt
        </Link>

        {/* Children with expandable fag lists */}
        {children.map((child) => {
          const isChildActive = activeChildId === child.id
          const fagWithVurd = Object.entries(child.fagDekning || {}).filter(
            ([, f]) => f.antallVurderinger > 0
          )

          return (
            <div key={child.id} className="mt-2">
              <Link
                href={`/foresatt/barn/${child.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isChildActive
                    ? "text-scan-text"
                    : "text-scan-text2 hover:text-scan-text hover:bg-scan-bg"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  isChildActive ? "bg-foresatt text-white" : "bg-gray-100 text-scan-text3"
                }`}>
                  {child.name.charAt(0)}
                </div>
                <span className="flex-1 truncate">{child.name}</span>
                <span className="text-[11px] text-scan-text3">{child.grade}.kl</span>
              </Link>

              {isChildActive && fagWithVurd.length > 0 && (
                <div className="pl-3 mt-0.5 space-y-0.5">
                  {fagWithVurd.map(([fagNavn, fag]) => (
                    <Link
                      key={fagNavn}
                      href={`/foresatt/barn/${child.id}?fag=${encodeURIComponent(fagNavn)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] text-scan-text3 hover:text-scan-text hover:bg-scan-bg transition-colors"
                    >
                      <span className="truncate">{fagNavn}</span>
                      <span className="font-mono text-[11px]">{fag.antallVurderinger}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-scan-border text-[11px] text-scan-text3">
        Nordvik ungdomsskole
      </div>

      {/* User */}
      <div className="p-3 border-t border-scan-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-foresatt-light flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-foresatt">
              {session?.user?.name ? getInitials(session.user.name) : "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-scan-text truncate">{session?.user?.name}</div>
            <div className="text-[11px] text-scan-text3">Foresatt</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 text-scan-text3 hover:text-scan-text transition-colors"
            title="Logg ut"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-scan-border bg-scan-surface px-4 md:hidden">
        <button onClick={() => setMobileMenuOpen(true)} className="p-1">
          <Menu className="h-5 w-5 text-scan-text" />
        </button>
        <span className="text-[15px] font-semibold text-scan-text">Foresattportal</span>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-52 bg-scan-surface border-r border-scan-border transform transition-transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-52 md:flex-col bg-scan-surface border-r border-scan-border">
        <SidebarContent />
      </aside>
    </>
  )
}
