import type { UserRole } from './database'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
