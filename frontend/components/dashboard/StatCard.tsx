const colors = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  orange: 'text-orange-600',
  default: 'text-gray-900',
}

export function StatCard({ label, value, color = 'default', sub }: { label: string; value: string | number; color?: keyof typeof colors; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
