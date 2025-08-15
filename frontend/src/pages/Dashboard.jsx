import React, { useEffect, useState } from 'react'
import { RefreshCw, DollarSign, Target, Clock, Fuel, TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts'
import apiService from '../services/api'

const Dashboard = () => {
  const [data, setData] = useState({
    totalProfit: 45780,
    efficiencyScore: 87,
    onTime: 23,
    totalOrders: 28,
    fuelCost: 12340,
    simulations: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const history = await apiService.getSimulationHistory()
        if (Array.isArray(history) && history.length) {
          const latest = history[0]
          setData({
            totalProfit: latest.overall_profit || 0,
            efficiencyScore: latest.efficiency_score || 0,
            onTime: latest.on_time_deliveries || 0,
            totalOrders: latest.total_orders || 0,
            fuelCost: latest.total_fuel_cost || 0,
            simulations: history.slice(0, 7)
          })
        }
      } catch (err) {
        console.warn('API unavailable, using demo data', err)
        // Fallback demo data
        const demo = [
          { overall_profit: 45780, efficiency_score: 87, on_time_deliveries: 23, total_orders: 28, total_fuel_cost: 12340, created_at: new Date().toISOString() },
          { overall_profit: 42150, efficiency_score: 82, on_time_deliveries: 19, total_orders: 25, total_fuel_cost: 11800, created_at: new Date(Date.now()-86400000).toISOString() },
          { overall_profit: 38900, efficiency_score: 78, on_time_deliveries: 17, total_orders: 22, total_fuel_cost: 10950, created_at: new Date(Date.now()-2*86400000).toISOString() },
        ]
        const latest = demo[0]
        setData({
          totalProfit: latest.overall_profit,
          efficiencyScore: latest.efficiency_score,
          onTime: latest.on_time_deliveries,
          totalOrders: latest.total_orders,
          fuelCost: latest.total_fuel_cost,
          simulations: demo
        })
      } finally {
        setLoading(false)
      }
    }
    load()
    // live refresh after simulations
    const handler = () => load()
    window.addEventListener('simulation-completed', handler)
    return () => window.removeEventListener('simulation-completed', handler)
  }, [])

  const onTimePct = data.totalOrders ? Math.round((data.onTime / data.totalOrders) * 100) : 0
  const deliveryData = [
    { name: 'On Time', value: onTimePct, color: '#10b981' },
    { name: 'Late', value: 100 - onTimePct, color: '#ef4444' }
  ]
  const fuelProfitData = data.simulations.map((s, i) => ({ month: `Sim ${i + 1}`, fuel: s.total_fuel_cost || 0, profit: s.overall_profit || 0 }))
  const trendData = data.simulations.map((s, i) => ({ simulation: `Simulation ${i + 1}`, profit: s.overall_profit || 0, efficiency: s.efficiency_score || 0 }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Logistics performance overview</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-black text-white px-4 py-2 rounded-md text-sm inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Profit" value={`$${data.totalProfit.toLocaleString()}`} icon={DollarSign} color="green" trend="+12% from last month" trendUp />
        <StatCard title="Efficiency Score" value={`${data.efficiencyScore}%`} icon={Target} color="blue" trend="+5% from last week" trendUp />
        <StatCard title="On-Time Deliveries" value={`${data.onTime}`} icon={Clock} color="purple" trend="-2 from yesterday" />
        <StatCard title="Total Fuel Cost" value={`$${data.fuelCost.toLocaleString()}`} icon={Fuel} color="orange" trend="+8% from last month" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Delivery Performance</h3>
          </div>
          <div className="p-5">
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deliveryData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {deliveryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <LegendDot color="bg-green-500" label={`On Time ${onTimePct}%`} />
              <LegendDot color="bg-red-500" label={`Late ${100 - onTimePct}%`} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Fuel Cost vs Profit</h3>
          </div>
          <div className="p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelProfitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'fuel' ? 'Fuel Cost' : 'Profit']} />
                  <Bar dataKey="fuel" fill="#f59e0b" name="fuel" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10b981" name="profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Profit & Efficiency Trend</h3>
          </div>
          <div className="p-5">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="simulation" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} name="Profit ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} name="Efficiency (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Recent Simulations</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Efficiency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.simulations.map((s, i) => {
                    const efficiency = s.efficiency_score || 0
                    const good = efficiency >= 85
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4"><span className="inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium text-gray-700 border-gray-300">{s.total_orders || 0}</span></td>
                        <td className="py-3 px-4"><span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${good ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{efficiency}%</span></td>
                        <td className="py-3 px-4 font-medium text-green-600">${(s.overall_profit || 0).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
    </div>
  )
}

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-sm text-gray-600">{label}</span>
  </div>
)

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp }) => {
  const palette = {
    green: { from: 'from-green-50', to: 'to-green-100', border: 'border-green-200', title: 'text-green-800', icon: 'text-green-600', value: 'text-green-900' },
    blue: { from: 'from-blue-50', to: 'to-blue-100', border: 'border-blue-200', title: 'text-blue-800', icon: 'text-blue-600', value: 'text-blue-900' },
    purple: { from: 'from-purple-50', to: 'to-purple-100', border: 'border-purple-200', title: 'text-purple-800', icon: 'text-purple-600', value: 'text-purple-900' },
    orange: { from: 'from-orange-50', to: 'to-orange-100', border: 'border-orange-200', title: 'text-orange-800', icon: 'text-orange-600', value: 'text-orange-900' },
  }[color]
  return (
    <div className={`border rounded-xl ${palette.border} bg-gradient-to-r ${palette.from} ${palette.to}`}>
      <div className="flex flex-row items-center justify-between space-y-0 p-5">
        <p className={`text-sm font-medium ${palette.title}`}>{title}</p>
        <Icon className={`h-4 w-4 ${palette.icon}`} />
      </div>
      <div className="px-5 pb-4">
        <div className={`text-2xl font-bold ${palette.value}`}>{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend && (trendUp ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-500" />)}
          {trend && <span className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-500'}`}>{trend}</span>}
        </div>
      </div>
    </div>
  )
}

export default Dashboard


