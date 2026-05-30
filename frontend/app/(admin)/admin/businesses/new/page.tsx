import Link from 'next/link'
import { NewBusinessForm } from '@/components/businesses/BusinessForm'

export default function NewBusinessPage() {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/businesses" className="text-sm text-gray-500 hover:text-gray-700">← Businesses</Link>
        <h1 className="text-xl font-semibold text-gray-900">Add Business</h1>
      </div>
      <NewBusinessForm />
    </div>
  )
}
