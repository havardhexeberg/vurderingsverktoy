"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Ugyldig e-post eller passord")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleQuickLogin = async (email: string) => {
    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password: "test",
      redirect: false,
    })

    if (result?.error) {
      setError("Innlogging feilet")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Vurderingsverktøy</CardTitle>
          <CardDescription>
            Logg inn for å fortsette
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logger inn..." : "Logg inn"}
            </Button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">Hurtiginnlogging (prototype):</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin("larer@test.no")}
                disabled={isLoading}
              >
                <span className="mr-2">👩‍🏫</span>
                Test Lærer (larer@test.no)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin("rektor@test.no")}
                disabled={isLoading}
              >
                <span className="mr-2">👔</span>
                Test Rektor (rektor@test.no)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin("foresatt@test.no")}
                disabled={isLoading}
              >
                <span className="mr-2">👪</span>
                Test Foresatt (foresatt@test.no)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
