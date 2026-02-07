import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ElevSidebar } from "@/components/elev/elev-sidebar"

export default async function ElevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user?.role !== "STUDENT") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-scan-bg">
      <ElevSidebar />
      <main className="md:ml-56 pt-14 md:pt-0">
        <div className="p-5 max-w-[960px]">{children}</div>
      </main>
    </div>
  )
}
