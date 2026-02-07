"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Home, List, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

interface SubjectInfo {
  name: string
  assessmentCount: number
}

export function ElevSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])

  useEffect(() => {
    fetch("/api/elev/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.subjects) {
          setSubjects(
            data.subjects.map((s: string) => ({
              name: s,
              assessmentCount: data.assessmentsBySubject?.[s]?.length || 0,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const navItems = [
    { label: "Hjem", href: "/elev", icon: Home },
    { label: "Alle vurderinger", href: "/elev/vurderinger", icon: List },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-scan-border">
        <Link href="/elev" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-6 h-6 rounded-md bg-elev flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="text-[15px] font-semibold text-scan-text">Elevportal</span>
        </Link>
        <button className="md:hidden p-1 text-scan-text3 hover:text-scan-text" onClick={() => setMobileMenuOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-elev-light text-elev"
                    : "text-scan-text2 hover:text-scan-text hover:bg-scan-bg"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Fag list */}
        {subjects.length > 0 && (
          <div className="mt-5">
            <div className="px-3 mb-1.5">
              <span className="text-[10px] font-semibold text-scan-text3 uppercase tracking-wider">Mine fag</span>
            </div>
            <div className="space-y-0.5">
              {subjects.map((subject) => {
                const href = `/elev/kompetanse?fag=${encodeURIComponent(subject.name)}`
                const isActive = pathname === "/elev/kompetanse" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fag") === subject.name
                return (
                  <Link
                    key={subject.name}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? "bg-elev-light text-elev font-medium"
                        : "text-scan-text2 hover:text-scan-text hover:bg-scan-bg"
                    }`}
                  >
                    <span className="truncate">{subject.name}</span>
                    <span className="font-mono text-[11px] text-scan-text3">{subject.assessmentCount}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-scan-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-elev-light flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-elev">
              {session?.user?.name ? getInitials(session.user.name) : "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-scan-text truncate">{session?.user?.name}</div>
            <div className="text-[11px] text-scan-text3">Elev</div>
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
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-scan-border bg-scan-surface px-4 md:hidden">
        <button onClick={() => setMobileMenuOpen(true)} className="p-1">
          <Menu className="h-5 w-5 text-scan-text" />
        </button>
        <span className="text-[15px] font-semibold text-scan-text">Elevportal</span>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-scan-surface border-r border-scan-border transform transition-transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-56 md:flex-col bg-scan-surface border-r border-scan-border">
        <SidebarContent />
      </aside>
    </>
  )
}
