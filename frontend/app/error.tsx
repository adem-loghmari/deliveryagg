'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-semibold text-gray-700">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Try again</button>
      </div>
    </div>
  )
}
