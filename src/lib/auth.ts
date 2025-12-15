import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { UserRole } from '@/types/database'

// Schema de validação do login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

// Função para criar cliente Supabase no auth
async function getSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore em Server Components
          }
        },
      },
    }
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validar input
          const { email, password } = loginSchema.parse(credentials)

          // Buscar usuário no Supabase
          const supabase = await getSupabaseClient()

          const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single()

          if (error || !user) {
            console.log('Usuário não encontrado:', email)
            return null
          }

          // Verificar senha
          const isValid = await bcrypt.compare(password, user.password_hash)

          if (!isValid) {
            console.log('Senha inválida para:', email)
            return null
          }

          // Log de login
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'login',
            entity: 'admin_users',
            entity_id: user.id,
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
          }
        } catch (error) {
          console.error('Erro no authorize:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
})
