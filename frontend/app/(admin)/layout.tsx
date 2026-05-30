import { verifyAdminSession } from '@/lib/dal'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession()
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="ADMIN" name="Admin" />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  )
}
