import { useAuth } from '../context/AuthContext'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-end gap-4 shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-brand-700" />
        </div>
        <span className="font-medium">{user?.fullName}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          user?.plan === 'PRO' ? 'bg-brand-100 text-brand-700'
          : user?.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700'
          : 'bg-gray-100 text-gray-500'
        }`}>
          {user?.plan}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-gray-700 transition-colors"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  )
}
