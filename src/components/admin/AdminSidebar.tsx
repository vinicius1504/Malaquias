'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Settings,
  Users,
  History,
  Shield,
  Handshake,
  MessageSquareQuote,
  Layers,
  PanelTop,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

interface AdminSidebarProps {
  user: {
    name: string
    email: string
    role: UserRole
  }
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Textos',
    href: '/admin/textos',
    icon: FileText,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Notícias',
    href: '/admin/noticias',
    icon: Newspaper,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Parceiros',
    href: '/admin/parceiros',
    icon: Handshake,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Depoimentos',
    href: '/admin/depoimentos',
    icon: MessageSquareQuote,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Segmentos',
    href: '/admin/segmentos',
    icon: Layers,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Landing Pages',
    href: '/admin/landing-pages',
    icon: PanelTop,
    roles: ['dev', 'admin'],
  },
  {
    label: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
    roles: ['dev'],
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: History,
    roles: ['dev'],
  },
  {
    label: 'Configurações',
    href: '/admin/config',
    icon: Settings,
    roles: ['dev', 'admin'],
  },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:block shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="relative w-36 h-10">
            <Image
              src="/images/logos/Vector.svg"
              alt="Malaquias"
              fill
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-medium text-sm truncate">{user.name}</p>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-amber-600" />
              <span className="text-xs text-amber-600 uppercase font-medium">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-amber-600 text-sm transition-colors"
        >
          Ver site
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>
      </div>
    </aside>
  )
}
