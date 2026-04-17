import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { endpointApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import AddEndpointModal from '../components/AddEndpointModal'
import {
  Plus, Trash2, ToggleLeft, ToggleRight, ArrowRight,
  Activity, ExternalLink, Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const PAGE_SIZE = 5

export default function Endpoints() {
  const [data, setData]           = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [page, setPage]           = useState(0)
  const [loading, setLoading]     = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError]         = useState('')

  const load = useCallback(async (pageNum = 0, isInitial = false) => {
    isInitial ? setLoading(true) : setPageLoading(true)
    try {
      const res = await endpointApi.list(pageNum, PAGE_SIZE)
      const raw = res.data
      // Handle both Page<T> (Spring) and plain array (legacy)
      if (Array.isArray(raw)) {
        setData({ content: raw, totalElements: raw.length, totalPages: 1 })
      } else {
        setData(raw)
      }
      setPage(pageNum)
    } catch (e) {
      setError('Failed to load endpoints')
    } finally {
      setLoading(false)
      setPageLoading(false)
    }
  }, [])

  useEffect(() => { load(0, true) }, [load])

  async function handleToggle(id) {
    await endpointApi.toggle(id)
    load(page)
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This will remove all monitoring history.`)) return
    await endpointApi.delete(id)
    // If deleting the last item on a non-first page, go back one page
    const newPage = data.content.length === 1 && page > 0 ? page - 1 : page
    load(newPage)
  }

  if (loading) return <LoadingSpinner />

  const { content: endpoints, totalElements, totalPages } = data

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

      {totalElements === 0 ? (
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
        <>
          <div className="card divide-y divide-gray-100">
            {pageLoading ? (
              <div className="px-6 py-12 text-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin inline-block" />
              </div>
            ) : (
              endpoints.map(ep => (
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
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => load(page - 1)}
              disabled={page === 0 || pageLoading}
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {totalPages <= 1 ? (
                <span className="text-sm text-gray-400">
                  {totalElements} endpoint{totalElements !== 1 ? 's' : ''}
                </span>
              ) : (
                Array.from({ length: totalPages }, (_, i) => i)
                  .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                  .reduce((acc, i, idx, arr) => {
                    if (idx > 0 && i - arr[idx - 1] > 1) acc.push('…')
                    acc.push(i)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => load(item)}
                        disabled={pageLoading}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                          item === page
                            ? 'bg-brand-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item + 1}
                      </button>
                    )
                  )
              )}
            </div>

            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages - 1 || pageLoading}
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {showModal && (
        <AddEndpointModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(page) }}
        />
      )}
    </div>
  )
}