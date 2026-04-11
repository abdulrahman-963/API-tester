import clsx from 'clsx'

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   val: 'text-blue-900'  },
  green:  { bg: 'bg-green-50',  icon: 'text-green-500',  val: 'text-green-900' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-500',    val: 'text-red-900'   },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-500', val: 'text-yellow-900'},
  gray:   { bg: 'bg-gray-50',   icon: 'text-gray-400',   val: 'text-gray-900'  },
}

export default function StatsCard({ label, value, icon: Icon, color = 'blue', alert = false }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue
  return (
    <div className={clsx('card p-5', alert && 'ring-2 ring-red-300')}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon className={clsx('w-4 h-4', c.icon)} />
        </div>
      </div>
      <div className={clsx('text-2xl font-bold', c.val)}>{value ?? '—'}</div>
    </div>
  )
}
