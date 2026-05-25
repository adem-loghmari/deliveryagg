'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth.actions'

interface NavItem { href: string; label: string; icon: string }

const businessNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/orders', label: 'Orders', icon: '📦' },
  { href: '/orders/new', label: 'New Order', icon: '➕' },
  { href: '/orders/bulk', label: 'Bulk Upload', icon: '📤' },
  { href: '/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/businesses', label: 'Businesses', icon: '🏪' },
  { href: '/admin/orders', label: 'All Orders', icon: '📦' },
  { href: '/admin/orders/new', label: 'Create Order', icon: '➕' },
  { href: '/admin/invoices', label: 'Invoices', icon: '🧾' },
]

function NavLinks({ nav, pathname, onClose }: { nav: NavItem[]; pathname: string; onClose?: () => void }) {
  return <>
    {nav.map(({ href, label, icon }) => (
      <Link key={href} href={href} onClick={onClose} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${pathname === href || pathname.startsWith(href + '/') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
        <span>{icon}</span>{label}
      </Link>
    ))}
  </>
}

export function Sidebar({ role, name }: { role: 'ADMIN' | 'BUSINESS'; name?: string }) {
  const pathname = usePathname()
  const nav = role === 'ADMIN' ? adminNav : businessNav
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <span className="text-lg font-bold text-blue-600">DeliveryAgg</span>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Open menu">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white h-full shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <span className="text-lg font-bold text-blue-600">DeliveryAgg</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">✕</button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto"><NavLinks nav={nav} pathname={pathname} onClose={() => setOpen(false)} /></nav>
            <div className="border-t border-gray-200 p-3">
              {name && <p className="text-xs text-gray-500 px-3 mb-2 truncate">{name}</p>}
              <form action={logout}><button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50">Sign out</button></form>
            </div>
          </div>
        </div>
      )}
      <aside className="hidden md:flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="text-lg font-bold text-blue-600">DeliveryAgg</div>
          {name && <div className="mt-0.5 truncate text-xs text-gray-500">{name}</div>}
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto"><NavLinks nav={nav} pathname={pathname} /></nav>
        <div className="border-t border-gray-200 p-3">
          <form action={logout}><button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50">Sign out</button></form>
        </div>
      </aside>
    </>
  )
}
