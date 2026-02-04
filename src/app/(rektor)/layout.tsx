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

  // Check if user is a principal
  if (session.user?.role !== "PRINCIPAL") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RektorSidebar />
      <main className="md:ml-64 pt-16 md:pt-0 p-6">{children}</main>
    </div>
  )
}
