import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ForesattSidebar } from "@/components/foresatt/foresatt-sidebar"

export default async function ForesattLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user?.role !== "PARENT") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-scan-bg">
      <ForesattSidebar />
      <main className="md:ml-52 pt-14 md:pt-0">
        <div className="p-5 max-w-[740px]">{children}</div>
      </main>
    </div>
  )
}
