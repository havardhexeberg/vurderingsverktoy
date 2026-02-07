import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ForesattHeader } from "@/components/foresatt/foresatt-header"

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
    <div className="min-h-screen bg-gray-50">
      <ForesattHeader />
      <main>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
