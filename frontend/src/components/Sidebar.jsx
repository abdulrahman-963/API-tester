import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Globe, Activity } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/endpoints',  icon: Globe,           label: 'Endpoints'  },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 py-6 shrink-0">
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2 font-bold text-lg text-brand-700">
          <Activity className="w-5 h-5" />
          APIMonitor
        </div>
        <div className="text-xs text-gray-400 mt-0.5">Reliability Platform</div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
