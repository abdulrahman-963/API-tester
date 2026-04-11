import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
