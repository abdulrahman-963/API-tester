import { Link } from 'react-router-dom'
import { Shield, TrendingUp, Bell, Zap, CheckCircle, ArrowRight, Activity } from 'lucide-react'

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-Time Uptime Monitoring',
    desc: 'Monitor every critical API endpoint — payments, checkout, auth — with checks as frequent as every minute.',
  },
  {
    icon: Zap,
    title: 'Instant On-Demand Testing',
    desc: 'One click to run an immediate health check when something feels wrong. Get status code, latency, and response preview instantly.',
  },
  {
    icon: Bell,
    title: 'Smart Alert System',
    desc: 'Receive email and webhook alerts the moment an API goes down. No alert fatigue — only transitions trigger notifications.',
  },
  {
    icon: TrendingUp,
    title: 'Reliability Insights',
    desc: 'Track uptime %, average latency, error rates, and failure history over 24 hours, 7 days, or 30 days.',
  },
  {
    icon: Shield,
    title: 'Revenue Protection',
    desc: 'Know about broken payment APIs, failed login flows, or checkout errors before your customers do.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 API endpoints', '5-min check interval', 'Email alerts', '7-day history'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    features: ['50 API endpoints', '1-min check interval', 'Email + Webhook alerts', '30-day history', 'Priority support'],
    cta: 'Start 14-Day Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    features: ['Unlimited endpoints', '1-min check interval', 'Custom integrations', '1-year history', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <Activity className="w-6 h-6" />
            APIMonitor
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Shield className="w-4 h-4" />
          Business API Reliability &amp; Revenue Protection
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Never Lose Revenue<br />
          <span className="text-brand-600">to a Broken API</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          APIMonitor watches your critical APIs 24/7 — payments, checkout, authentication — and alerts you the instant something breaks, before your customers feel it.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Start Monitoring Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">
            View Dashboard
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required · 5 endpoints free forever</p>
      </section>

      {/* Stats strip */}
      <section className="bg-brand-700 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            ['99.9%', 'Platform Uptime'],
            ['< 60s', 'Alert Delivery'],
            ['1 min', 'Min Check Interval'],
            ['24/7', 'Always Watching'],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold">{val}</div>
              <div className="text-brand-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Everything You Need to Protect Revenue
        </h2>
        <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
          Built for e-commerce, SaaS, and fintech businesses that can't afford API downtime.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-500 mb-16">Start free. Upgrade when you need more.</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {PRICING.map(plan => (
              <div
                key={plan.name}
                className={`card p-8 flex flex-col ${plan.highlight ? 'border-brand-500 border-2 ring-2 ring-brand-100' : ''}`}
              >
                {plan.highlight && (
                  <span className="text-xs font-semibold bg-brand-600 text-white px-3 py-1 rounded-full self-start mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 ml-1 text-sm">/{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={plan.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Start Protecting Your Revenue Today
        </h2>
        <p className="text-gray-500 mb-8">
          Join businesses that trust APIMonitor to keep their critical APIs running.
        </p>
        <Link to="/register" className="btn-primary px-8 py-3 text-base">
          Get Started Free — No Card Required
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-brand-700">
            <Activity className="w-4 h-4" />
            APIMonitor
          </div>
          <span>© {new Date().getFullYear()} APIMonitor. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
