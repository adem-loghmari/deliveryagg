import { verifyBusinessSession } from '@/lib/dal'
import { apiClient } from '@/lib/api-client'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyBusinessSession()
  let businessName: string | undefined
  if (session.businessId) {
    try { const b = await apiClient<{ name: string }>(`/api/businesses/${session.businessId}`); businessName = b.name } catch {}
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="BUSINESS" name={businessName} />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  )
}
