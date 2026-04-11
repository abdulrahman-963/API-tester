import clsx from 'clsx'

const CONFIG = {
  UP:      { dot: 'bg-green-400',  bg: 'bg-green-100',  text: 'text-green-700', label: 'UP'      },
  DOWN:    { dot: 'bg-red-400',    bg: 'bg-red-100',    text: 'text-red-700',   label: 'DOWN'    },
  UNKNOWN: { dot: 'bg-gray-300',   bg: 'bg-gray-100',   text: 'text-gray-500',  label: 'UNKNOWN' },
}

export default function StatusBadge({ status = 'UNKNOWN', small = false }) {
  const cfg = CONFIG[status] ?? CONFIG.UNKNOWN
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-semibold rounded-full',
      cfg.bg, cfg.text,
      small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      <span className={clsx('rounded-full shrink-0', cfg.dot, small ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {cfg.label}
    </span>
  )
}
