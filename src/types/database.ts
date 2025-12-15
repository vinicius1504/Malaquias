export type UserRole = 'dev' | 'admin'

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  locale: 'pt' | 'en' | 'es'
  section: string
  key: string
  value: string
  updated_by: string | null
  updated_at: string
}

export interface News {
  id: string
  slug: string
  category: string
  category_id: string | null
  status: 'draft' | 'published'
  image_url: string | null
  image_banner: string | null
  author_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface NewsTranslation {
  id: string
  news_id: string
  locale: 'pt' | 'en' | 'es'
  title: string
  excerpt: string | null
  content: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  entity: string
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// Database schema para Supabase
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AdminUser, 'id'>>
      }
      content: {
        Row: Content
        Insert: Omit<Content, 'id' | 'updated_at'>
        Update: Partial<Omit<Content, 'id'>>
      }
      news: {
        Row: News
        Insert: Omit<News, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<News, 'id'>>
      }
      news_translations: {
        Row: NewsTranslation
        Insert: Omit<NewsTranslation, 'id'>
        Update: Partial<Omit<NewsTranslation, 'id'>>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
