import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi, monitoringApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Activity, ArrowRight, CheckCircle, XCircle, HelpCircle, Zap, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const { user }   = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState(null)
  const [testResults, setTestResults] = useState({})

  async function fetchSummary() {
    try {
      const res = await dashboardApi.summary()
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    const interval = setInterval(fetchSummary, 30_000)
    return () => clearInterval(interval)
  }, [])

  async function runTest(endpointId, e) {
    e.preventDefault()
    e.stopPropagation()
    setTestingId(endpointId)
    try {
      const res = await monitoringApi.runTest(endpointId)
      setTestResults(prev => ({ ...prev, [endpointId]: res.data }))
      fetchSummary()
    } catch (err) {
      console.error(err)
    } finally {
      setTestingId(null)
    }
  }

  if (loading) return <LoadingSpinner />

  const { totalEndpoints, upEndpoints, downEndpoints, overallUptimePercent, endpoints = [] } = data || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's the reliability status of your APIs right now.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Endpoints"
          value={totalEndpoints}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          label="Endpoints Up"
          value={upEndpoints}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          label="Endpoints Down"
          value={downEndpoints}
          icon={XCircle}
          color="red"
          alert={downEndpoints > 0}
        />
        <StatsCard
          label="Overall Uptime (24h)"
          value={`${overallUptimePercent ?? 0}%`}
          icon={Activity}
          color={overallUptimePercent >= 99 ? 'green' : overallUptimePercent >= 95 ? 'yellow' : 'red'}
        />
      </div>

      {/* Endpoints List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">API Endpoints</h2>
          <Link to="/endpoints" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {endpoints.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No endpoints yet</p>
            <p className="text-sm text-gray-400 mb-4">Add your first API to start monitoring</p>
            <Link to="/endpoints" className="btn-primary text-sm">Add Endpoint</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {endpoints.map(ep => {
              const tr = testResults[ep.id]
              return (
                <div key={ep.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <StatusBadge status={ep.status} />
                  <div className="flex-1 min-w-0">
                    <Link to={`/endpoints/${ep.id}`} className="font-medium text-gray-900 hover:text-brand-600 truncate block">
                      {ep.name}
                    </Link>
                    <p className="text-xs text-gray-400 truncate">{ep.url}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
                    <span title="Uptime (24h)">
                      {ep.uptimePercent != null ? `${ep.uptimePercent}%` : '—'}
                    </span>
                    <span title="Avg response time">
                      {ep.avgResponseTimeMs != null ? `${Math.round(ep.avgResponseTimeMs)}ms` : '—'}
                    </span>
                    <span title="Last check" className="hidden lg:block">
                      {ep.lastCheckedAt
                        ? formatDistanceToNow(new Date(ep.lastCheckedAt), { addSuffix: true })
                        : 'Never'}
                    </span>
                  </div>
                  {tr && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      tr.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tr.statusCode ?? tr.status} · {tr.responseTimeMs}ms
                    </span>
                  )}
                  <button
                    onClick={e => runTest(ep.id, e)}
                    disabled={testingId === ep.id}
                    className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                    title="Run on-demand test"
                  >
                    {testingId === ep.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><Zap className="w-3 h-3" /> Test</>
                    }
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
