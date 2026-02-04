import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Mock users for prototype
const MOCK_USERS = [
  {
    id: "teacher-1",
    email: "larer@test.no",
    name: "Test Lærer",
    role: "TEACHER",
  },
  {
    id: "principal-1",
    email: "rektor@test.no",
    name: "Test Rektor",
    role: "PRINCIPAL",
  },
  {
    id: "parent-1",
    email: "foresatt@test.no",
    name: "Test Foresatt",
    role: "PARENT",
  },
]

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        // Mock authentication - accept any password for prototype
        const user = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
