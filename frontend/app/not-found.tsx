import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-700">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Go home</Link>
      </div>
    </div>
  )
}
