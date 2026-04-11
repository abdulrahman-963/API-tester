/**
 * Visual uptime bar — each slot represents one check result.
 * Green = UP, red = DOWN.
 */
export default function UptimeBar({ results = [] }) {
  if (results.length === 0) {
    return <p className="text-sm text-gray-400">No check data yet.</p>
  }

  return (
    <div>
      <div className="flex gap-0.5 h-8 rounded overflow-hidden">
        {results.map((r, i) => (
          <div
            key={r.id ?? i}
            title={`${r.status} · ${r.responseTimeMs ?? '?'}ms · ${new Date(r.checkedAt).toLocaleTimeString()}`}
            className={`flex-1 min-w-1 rounded-sm transition-opacity hover:opacity-75 ${
              r.status === 'UP' ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{new Date(results[0]?.checkedAt).toLocaleTimeString()}</span>
        <span>{new Date(results[results.length - 1]?.checkedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
