import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Mock users for prototype - matches seed data
const MOCK_USERS = [
  // Principal
  {
    id: "principal-1",
    email: "rektor@test.no",
    name: "Kari Nordmann",
    role: "PRINCIPAL",
  },
  // Teachers
  {
    id: "teacher-1",
    email: "larer@test.no",
    name: "Ole Hansen",
    role: "TEACHER",
  },
  {
    id: "teacher-2",
    email: "norsk.larer@test.no",
    name: "Anna Larsen",
    role: "TEACHER",
  },
  {
    id: "teacher-3",
    email: "engelsk.larer@test.no",
    name: "Erik Berg",
    role: "TEACHER",
  },
  {
    id: "teacher-4",
    email: "spansk.larer@test.no",
    name: "Maria Garcia",
    role: "TEACHER",
  },
  {
    id: "teacher-5",
    email: "naturfag.larer@test.no",
    name: "Per Olsen",
    role: "TEACHER",
  },
  {
    id: "teacher-6",
    email: "samfunn.larer@test.no",
    name: "Line Johansen",
    role: "TEACHER",
  },
  {
    id: "teacher-7",
    email: "kunst.larer@test.no",
    name: "Kristin Vik",
    role: "TEACHER",
  },
  {
    id: "teacher-8",
    email: "gym.larer@test.no",
    name: "Thomas Moe",
    role: "TEACHER",
  },
  // Parent
  {
    id: "parent-1",
    email: "foresatt@test.no",
    name: "Trude Hansen",
    role: "PARENT",
  },
  // Student
  {
    id: "student-1",
    email: "elev@test.no",
    name: "Emma Hansen",
    role: "STUDENT",
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
