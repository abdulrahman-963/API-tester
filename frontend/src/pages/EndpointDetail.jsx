import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { endpointApi, monitoringApi, alertApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import UptimeBar from '../components/UptimeBar'
import {
  ArrowLeft, Zap, Loader2, Bell, BellOff, Trash2, Plus,
  CheckCircle, XCircle, Clock, TrendingUp, Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const HIST_PAGE_SIZE = 10

export default function EndpointDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [endpoint, setEndpoint]       = useState(null)
  const [stats, setStats]             = useState(null)
  const [history, setHistory]         = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [histPage, setHistPage]       = useState(0)
  const [histLoading, setHistLoading] = useState(false)
  const [alerts, setAlerts]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [testing, setTesting]         = useState(false)
  const [testResult, setTestResult]   = useState(null)
  const [alertForm, setAlertForm]     = useState({ alertType: 'EMAIL', destination: '' })
  const [addingAlert, setAddingAlert] = useState(false)

  const loadHistory = useCallback(async (pageNum) => {
    setHistLoading(true)
    try {
      const res = await monitoringApi.history(id, pageNum, HIST_PAGE_SIZE)
      setHistory(res.data)
      setHistPage(pageNum)
    } catch (e) {
      console.error(e)
    } finally {
      setHistLoading(false)
    }
  }, [id])

  const load = useCallback(async () => {
    try {
      const [epRes, statsRes, histRes, alertsRes] = await Promise.all([
        endpointApi.get(id),
        monitoringApi.stats(id, 24),
        monitoringApi.history(id, 0, HIST_PAGE_SIZE),
        alertApi.list(id),
      ])
      setEndpoint(epRes.data)
      setStats(statsRes.data)
      setHistory(histRes.data)
      setHistPage(0)              // always reset to page 0 on full reload
      setAlerts(alertsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function runTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await monitoringApi.runTest(id)
      setTestResult(res.data)
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setTesting(false)
    }
  }

  async function addAlert(e) {
    e.preventDefault()
    setAddingAlert(true)
    try {
      await alertApi.create(id, alertForm)
      setAlertForm({ alertType: 'EMAIL', destination: '' })
      const res = await alertApi.list(id)
      setAlerts(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setAddingAlert(false)
    }
  }

  async function deleteAlert(ruleId) {
    await alertApi.delete(id, ruleId)
    const res = await alertApi.list(id)
    setAlerts(res.data)
  }

  if (loading) return <LoadingSpinner />
  if (!endpoint) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Endpoint not found.</p>
      <Link to="/endpoints" className="btn-secondary mt-4">Back to Endpoints</Link>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/endpoints')} className="mt-1 text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{endpoint.name}</h1>
            <StatusBadge status={endpoint.lastStatus} />
            {!endpoint.active && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Paused</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 font-mono break-all">{endpoint.url}</p>
        </div>
        <button
          onClick={runTest}
          disabled={testing}
          className="btn-primary shrink-0"
        >
          {testing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</>
            : <><Zap className="w-4 h-4" /> Run Test</>
          }
        </button>
      </div>

      {/* On-demand test result */}
      {testResult && (
        <div className={`card p-4 border-l-4 ${
          testResult.status === 'UP' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            {testResult.status === 'UP'
              ? <CheckCircle className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-red-600" />
            }
            <span className="font-semibold">
              {testResult.status === 'UP' ? 'API is UP' : 'API is DOWN'}
            </span>
            <span className="text-sm text-gray-600">
              Status {testResult.statusCode ?? 'N/A'} · {testResult.responseTimeMs}ms
            </span>
            <span className="text-xs text-gray-400 ml-auto">Just now</span>
          </div>
          {testResult.errorMessage && (
            <p className="text-sm text-red-600 mt-2 ml-8">{testResult.errorMessage}</p>
          )}
          {testResult.responseBodyPreview && (
            <pre className="text-xs bg-white rounded border border-gray-200 p-2 mt-3 ml-8 overflow-auto max-h-32 font-mono">
              {testResult.responseBodyPreview}
            </pre>
          )}
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Uptime (24h)', value: `${stats.uptimePercent}%`, icon: TrendingUp, good: stats.uptimePercent >= 99 },
            { label: 'Avg Response', value: `${Math.round(stats.avgResponseTimeMs)}ms`, icon: Clock },
            { label: 'Total Checks', value: stats.totalChecks, icon: Activity },
            { label: 'Failures', value: stats.failureCount, icon: XCircle, bad: stats.failureCount > 0 },
          ].map(({ label, value, icon: Icon, good, bad }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${good ? 'text-green-500' : bad ? 'text-red-500' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <div className={`text-2xl font-bold ${good ? 'text-green-700' : bad ? 'text-red-600' : 'text-gray-900'}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uptime bar */}
      {history.content.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Checks</h3>
          <UptimeBar results={history.content.slice(0, 40).reverse()} />
        </div>
      )}

      {/* Config */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            ['Method', endpoint.method],
            ['Check Interval', `Every ${endpoint.checkIntervalMinutes} min`],
            ['Expected Status', endpoint.expectedStatus],
            ['Timeout', `${endpoint.timeoutMs / 1000}s`],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-gray-400 text-xs">{k}</div>
              <div className="font-medium mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Rules */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Alert Rules
        </h3>

        {alerts.length > 0 && (
          <div className="space-y-2 mb-5">
            {alerts.map(rule => (
              <div key={rule.id} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  rule.alertType === 'EMAIL'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {rule.alertType}
                </span>
                <span className="text-gray-700 flex-1 truncate">{rule.destination}</span>
                {rule.active
                  ? <Bell className="w-4 h-4 text-green-500" />
                  : <BellOff className="w-4 h-4 text-gray-400" />
                }
                <button
                  onClick={() => deleteAlert(rule.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addAlert} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="label">Type</label>
            <select
              className="input w-28"
              value={alertForm.alertType}
              onChange={e => setAlertForm(f => ({ ...f, alertType: e.target.value }))}
            >
              <option value="EMAIL">Email</option>
              <option value="WEBHOOK">Webhook</option>
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="label">
              {alertForm.alertType === 'EMAIL' ? 'Email address' : 'Webhook URL'}
            </label>
            <input
              type={alertForm.alertType === 'EMAIL' ? 'email' : 'url'}
              required
              className="input"
              placeholder={alertForm.alertType === 'EMAIL' ? 'alerts@company.com' : 'https://hooks.example.com/…'}
              value={alertForm.destination}
              onChange={e => setAlertForm(f => ({ ...f, destination: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={addingAlert} className="btn-secondary">
            {addingAlert ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add</>}
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Check History</h3>
          {history.totalElements > 0 && (
            <span className="text-xs text-gray-400">{history.totalElements} total checks</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Response Time</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Time</th>
                <th className="px-6 py-3 text-left">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {histLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </td>
                </tr>
              ) : history.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No check history yet.
                  </td>
                </tr>
              ) : (
                history.content.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3"><StatusBadge status={r.status} small /></td>
                    <td className="px-6 py-3 font-mono text-gray-700">{r.statusCode ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {r.responseTimeMs != null ? `${r.responseTimeMs}ms` : '—'}
                    </td>
                    <td className="px-6 py-3">
                      {r.onDemand
                        ? <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Manual</span>
                        : <span className="text-xs text-gray-400">Scheduled</span>
                      }
                    </td>
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(r.checkedAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-3 text-red-500 text-xs max-w-xs truncate">
                      {r.errorMessage ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {history.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => loadHistory(histPage - 1)}
              disabled={histPage === 0 || histLoading}
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: history.totalPages }, (_, i) => i)
                .filter(i => i === 0 || i === history.totalPages - 1 || Math.abs(i - histPage) <= 1)
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
                      onClick={() => loadHistory(item)}
                      disabled={histLoading}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        item === histPage
                          ? 'bg-brand-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item + 1}
                    </button>
                  )
                )
              }
            </div>

            <button
              onClick={() => loadHistory(histPage + 1)}
              disabled={histPage >= history.totalPages - 1 || histLoading}
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
