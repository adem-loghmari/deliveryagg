import { apiClient } from '@/lib/api-client'
import { StatCard } from '@/components/dashboard/StatCard'
import { DashboardMonthSelector } from '@/components/dashboard/DashboardMonthSelector'
import Link from 'next/link'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']

interface Data { all: Record<string,number>; thisPeriod: Record<string,number>; totalRevenue: number; totalMargin: number; month: number; year: number; perBusiness: Array<{ id: string; name: string; totalOrders: number; monthDelivered: number; monthCancelled: number; monthRevenue: number; monthMargin: number }> }

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const params = await searchParams
  const now = new Date()
  const month = params.month ?? String(now.getMonth() + 1)
  const year = params.year ?? String(now.getFullYear())
  let data: Data | null = null
  try { data = await apiClient<Data>(`/api/dashboard/admin?month=${month}&year=${year}`) } catch {}
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <DashboardMonthSelector month={parseInt(month)} year={parseInt(year)} />
      </div>
      <p className="text-sm text-gray-500 mb-6">{MONTHS[parseInt(month)]} {year}</p>
      {data ? (<>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Revenue (TND)" value={data.totalRevenue.toFixed(3)} color="green" />
          <StatCard label="Margin (TND)" value={data.totalMargin.toFixed(3)} color="blue" />
          <StatCard label="Delivered" value={data.thisPeriod.DELIVERED ?? 0} color="green" />
          <StatCard label="Cancelled" value={data.thisPeriod.CANCELLED ?? 0} color="orange" />
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">Per-business — {MONTHS[parseInt(month)]} {year}</h2></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">Business</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Delivered</th><th className="px-5 py-3">Cancelled</th><th className="px-5 py-3">Revenue</th><th className="px-5 py-3">Margin</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.perBusiness.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3"><Link href={`/admin/businesses/${b.id}`} className="font-medium text-blue-600 hover:underline">{b.name}</Link></td>
                  <td className="px-5 py-3 text-gray-600">{b.totalOrders}</td>
                  <td className="px-5 py-3 text-green-600">{b.monthDelivered}</td>
                  <td className="px-5 py-3 text-orange-600">{b.monthCancelled}</td>
                  <td className="px-5 py-3">{b.monthRevenue.toFixed(3)}</td>
                  <td className="px-5 py-3 font-medium text-blue-600">{b.monthMargin.toFixed(3)}</td>
                </tr>
              ))}
              {!data.perBusiness.length && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No businesses yet</td></tr>}
            </tbody>
          </table>
        </div>
      </>) : <p className="mt-6 text-sm text-gray-500">No data available.</p>}
    </div>
  )
}
