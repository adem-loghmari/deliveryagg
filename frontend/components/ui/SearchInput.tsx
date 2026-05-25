'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState } from 'react'

export function SearchInput({ placeholder = 'Search...', paramName = 'q' }: { placeholder?: string; paramName?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get(paramName) ?? '')
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValue(v)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (v) params.set(paramName, v); else params.delete(paramName)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    })
  }
  return <input type="search" value={value} onChange={handleChange} placeholder={placeholder} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52" />
}
