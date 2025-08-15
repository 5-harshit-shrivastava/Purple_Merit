import React, { useState } from 'react'
import api from '../services/api'

const Simulation = () => {
  const [availableDrivers, setAvailableDrivers] = useState(5)
  const [maxHoursPerDriver, setMaxHoursPerDriver] = useState(8)
  const [routeStartDate, setRouteStartDate] = useState(new Date().toISOString().slice(0,10))
  const [routeStartTime, setRouteStartTime] = useState('08:00')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const run = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.runSimulation({
        available_drivers: availableDrivers,
        route_start_time: routeStartTime,
        max_hours_per_driver: maxHoursPerDriver,
      })
      setResult(data?.results || data)
      // Notify dashboard to refresh in real-time
      window.dispatchEvent(new Event('simulation-completed'))
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Simulation failed'
      setResult(null)
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Run Simulation</h2>
      <form onSubmit={run} className="bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <label className="flex flex-col text-sm text-gray-700">
          Available Drivers
          <input type="number" min={1} value={availableDrivers} onChange={(e)=>setAvailableDrivers(parseInt(e.target.value||0))} className="border rounded-md px-3 py-2" />
        </label>
        <label className="flex flex-col text-sm text-gray-700">
          Max Hours / Driver
          <input type="number" min={1} max={24} value={maxHoursPerDriver} onChange={(e)=>setMaxHoursPerDriver(parseInt(e.target.value||0))} className="border rounded-md px-3 py-2" />
        </label>
        <label className="flex flex-col text-sm text-gray-700">
          Start Date
          <input type="date" value={routeStartDate} onChange={(e)=>setRouteStartDate(e.target.value)} className="border rounded-md px-3 py-2" />
        </label>
        <label className="flex flex-col text-sm text-gray-700">
          Start Time
          <input type="time" value={routeStartTime} onChange={(e)=>setRouteStartTime(e.target.value)} className="border rounded-md px-3 py-2" />
        </label>
        <div className="md:col-span-4">
          <button className="bg-black text-white px-4 py-2 rounded-md text-sm" disabled={loading}>{loading? 'Running…' : 'Run Simulation'}</button>
        </div>
      </form>
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <Kpi label="Total Orders" value={result.total_orders} />
            <Kpi label="On-Time Deliveries" value={result.on_time_deliveries} />
            <Kpi label="Efficiency Score" value={`${result.efficiency_score}%`} />
            <Kpi label="Overall Profit" value={`$${result.financial_summary?.overall_profit?.toLocaleString?.() || result.financial_summary?.overall_profit}`} />
          </div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

const Kpi = ({ label, value }) => (
  <div>
    <div className="text-gray-500">{label}</div>
    <div className="text-gray-900 font-semibold">{value}</div>
  </div>
)

export default Simulation


