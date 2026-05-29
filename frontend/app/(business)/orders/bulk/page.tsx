import { verifyBusinessSession } from '@/lib/dal'
import { BulkUploadForm } from '@/components/orders/BulkUploadForm'

export default async function BulkOrderPage() {
  const session = await verifyBusinessSession()
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Bulk Order Upload</h1>
      <p className="text-sm text-gray-500 mb-6">Upload a CSV file to create multiple orders at once.</p>
      <BulkUploadForm businessId={session.businessId} />
    </div>
  )
}
