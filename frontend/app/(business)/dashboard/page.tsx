import { apiClient } from '@/lib/api-client'
import { StatCard } from '@/components/dashboard/StatCard'
import { DashboardMonthSelector } from '@/components/dashboard/DashboardMonthSelector'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']

interface Data { all: Record<string,number>; thisPeriod: Record<string,number>; periodCost: number; savings: number; deliveryRate: number; cancellationRate: number; marketDeliveryRate: number; marketCancellationRate: number; month: number; year: number; totalCodDelivered: number }

export default async function BusinessDashboard({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const params = await searchParams
  const now = new Date()
  const month = params.month ?? String(now.getMonth() + 1)
  const year = params.year ?? String(now.getFullYear())
  let data: Data | null = null
  try { data = await apiClient<Data>(`/api/dashboard/business?month=${month}&year=${year}`) } catch {}
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <DashboardMonthSelector month={parseInt(month)} year={parseInt(year)} />
      </div>
      <p className="text-sm text-gray-500 mb-6">{MONTHS[parseInt(month)]} {year}</p>
      {data ? (<>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Delivered" value={data.thisPeriod.DELIVERED ?? 0} color="green" />
          <StatCard label="Cancelled" value={data.thisPeriod.CANCELLED ?? 0} color="orange" />
          <StatCard label="Period cost (TND)" value={data.periodCost.toFixed(3)} color="blue" />
          <StatCard label="Savings vs market (TND)" value={data.savings.toFixed(3)} color="green" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="COD collected (TND)" value={data.totalCodDelivered.toFixed(3)} color="blue" />
          <StatCard label="All time total" value={Object.values(data.all).reduce((a,b)=>a+b,0)} />
          <StatCard label="Your delivery rate" value={`${data.deliveryRate} TND`} color="blue" />
          <StatCard label="Your cancellation rate" value={`${data.cancellationRate} TND`} color="blue" />
        </div>
      </>) : <p className="mt-6 text-sm text-gray-500">No data yet. Create your first order to get started.</p>}
    </div>
  )
}
