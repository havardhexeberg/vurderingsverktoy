import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default async function MinSidePage() {
  const session = await getServerSession(authOptions)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleName = (role: string | undefined) => {
    switch (role) {
      case "TEACHER":
        return "Lærer"
      case "PRINCIPAL":
        return "Rektor"
      case "PARENT":
        return "Foresatt"
      default:
        return "Ukjent rolle"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Min side</h1>
        <p className="text-gray-600 mt-1">
          Administrer din profil og innstillinger
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Din brukerinformasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                {session?.user?.name ? getInitials(session.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
              <p className="text-gray-600">{session?.user?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {getRoleName(session?.user?.role)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistikk</CardTitle>
          <CardDescription>
            Din aktivitet i systemet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Vurderinger registrert</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Elever i mine grupper</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Faggrupper</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
