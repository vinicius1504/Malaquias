import type { UserRole, AdminScreen } from './database'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    permissions: AdminScreen[]
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      permissions: AdminScreen[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    permissions: AdminScreen[]
  }
}
