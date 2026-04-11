import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { endpointApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import AddEndpointModal from '../components/AddEndpointModal'
import {
  Plus, Trash2, ToggleLeft, ToggleRight, ArrowRight,
  Activity, ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Endpoints() {
  const [endpoints, setEndpoints] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError]         = useState('')

  async function load() {
    try {
      const res = await endpointApi.list()
      setEndpoints(res.data)
    } catch (e) {
      setError('Failed to load endpoints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleToggle(id) {
    await endpointApi.toggle(id)
    load()
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This will remove all monitoring history.`)) return
    await endpointApi.delete(id)
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Endpoints</h1>
          <p className="text-sm text-gray-500 mt-1">Manage which APIs to monitor for reliability.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Endpoint
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {endpoints.length === 0 ? (
        <div className="card p-16 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No endpoints yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Add your first critical API — payment gateway, login service, or checkout — to start monitoring it.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Your First Endpoint
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {endpoints.map(ep => (
            <div key={ep.id} className="px-6 py-4 flex items-center gap-4">
              <StatusBadge status={ep.lastStatus} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/endpoints/${ep.id}`}
                    className="font-medium text-gray-900 hover:text-brand-600 truncate"
                  >
                    {ep.name}
                  </Link>
                  {!ep.active && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Paused</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <span className="truncate max-w-xs">{ep.url}</span>
                  <a href={ep.url} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-brand-600">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500 shrink-0">
                <span>{ep.method}</span>
                <span>{ep.checkIntervalMinutes}m interval</span>
                <span>
                  {ep.lastCheckedAt
                    ? formatDistanceToNow(new Date(ep.lastCheckedAt), { addSuffix: true })
                    : 'Never checked'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(ep.id)}
                  className="text-gray-400 hover:text-brand-600 transition-colors"
                  title={ep.active ? 'Pause monitoring' : 'Resume monitoring'}
                >
                  {ep.active
                    ? <ToggleRight className="w-5 h-5 text-brand-500" />
                    : <ToggleLeft className="w-5 h-5" />
                  }
                </button>
                <Link
                  to={`/endpoints/${ep.id}`}
                  className="text-gray-400 hover:text-brand-600 transition-colors"
                  title="View details"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(ep.id, ep.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete endpoint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddEndpointModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
