'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true); toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }
  return <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-blue-600 px-1" title={`Copy ${label}`}>{copied ? '✓' : '⧉'}</button>
}
