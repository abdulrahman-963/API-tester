import { useState } from 'react'
import { endpointApi } from '../services/api'
import { X, Loader2 } from 'lucide-react'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
const INTERVALS    = [1, 5, 10, 15, 30, 60]

export default function AddEndpointModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    url: '',
    method: 'GET',
    checkIntervalMinutes: 5,
    expectedStatus: 200,
    timeoutMs: 5000,
    requestBody: '',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [advanced, setAdvanced] = useState(false)

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await endpointApi.create({
        ...form,
        checkIntervalMinutes: Number(form.checkIntervalMinutes),
        expectedStatus: Number(form.expectedStatus),
        timeoutMs: Number(form.timeoutMs),
      })
      onCreated()
    } catch (err) {
      const d = err.response?.data
      setError(d?.detail || JSON.stringify(d?.errors) || 'Failed to create endpoint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Add API Endpoint</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div>
            <label className="label">Endpoint Name *</label>
            <input
              className="input"
              placeholder="e.g. Payment Gateway"
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div>
            <label className="label">URL *</label>
            <input
              className="input font-mono text-sm"
              placeholder="https://api.example.com/health"
              required
              value={form.url}
              onChange={e => set('url', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">HTTP Method</label>
              <select
                className="input"
                value={form.method}
                onChange={e => set('method', e.target.value)}
              >
                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Check Interval</label>
              <select
                className="input"
                value={form.checkIntervalMinutes}
                onChange={e => set('checkIntervalMinutes', e.target.value)}
              >
                {INTERVALS.map(i => <option key={i} value={i}>Every {i} min</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Expected Status</label>
              <input
                type="number"
                className="input"
                min={100} max={599}
                value={form.expectedStatus}
                onChange={e => set('expectedStatus', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Timeout (ms)</label>
              <select
                className="input"
                value={form.timeoutMs}
                onChange={e => set('timeoutMs', e.target.value)}
              >
                {[3000, 5000, 10000, 15000, 30000].map(t => (
                  <option key={t} value={t}>{t / 1000}s</option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced */}
          <button
            type="button"
            onClick={() => setAdvanced(!advanced)}
            className="text-sm text-brand-600 hover:underline"
          >
            {advanced ? 'Hide' : 'Show'} advanced options
          </button>

          {advanced && (
            <div>
              <label className="label">Request Body (JSON, for POST/PUT)</label>
              <textarea
                className="input font-mono text-xs min-h-20"
                placeholder='{"key": "value"}'
                value={form.requestBody}
                onChange={e => set('requestBody', e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
