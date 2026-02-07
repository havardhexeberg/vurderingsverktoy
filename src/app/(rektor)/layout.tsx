import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RektorSidebar } from "@/components/rektor/rektor-sidebar"

export default async function RektorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user?.role !== "PRINCIPAL") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-scan-bg">
      <RektorSidebar />
      <main className="md:ml-56 pt-14 md:pt-0 p-7 max-w-[960px]">{children}</main>
    </div>
  )
}
