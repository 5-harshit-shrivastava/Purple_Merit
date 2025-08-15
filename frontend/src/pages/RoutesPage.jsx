import React, { useEffect, useState } from 'react'
import api from '../services/api'

const RoutesPage = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  // create form
  const [routeId, setRouteId] = useState('')
  const [distanceKm, setDistanceKm] = useState(10)
  const [trafficLevel, setTrafficLevel] = useState('Low')
  const [baseTime, setBaseTime] = useState(30)
  // edit state
  const [editingId, setEditingId] = useState(null)
  const [edit, setEdit] = useState({ route_id: '', distance_km: 0, traffic_level: 'Low', base_time_minutes: 0 })

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getRoutes()
      setRoutes(data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const addRoute = async (e) => {
    e.preventDefault()
    if (!routeId.trim()) return
    await api.createRoute({ route_id: routeId, distance_km: Number(distanceKm), traffic_level: trafficLevel, base_time_minutes: Number(baseTime) })
    setRouteId(''); setDistanceKm(10); setTrafficLevel('Low'); setBaseTime(30)
    load()
  }

  const startEdit = (r) => {
    setEditingId(r.id)
    setEdit({ route_id: r.route_id, distance_km: r.distance_km, traffic_level: r.traffic_level, base_time_minutes: r.base_time_minutes })
  }
  const cancelEdit = () => { setEditingId(null) }
  const saveEdit = async (id) => {
    await api.updateRoute(id, edit)
    cancelEdit(); load()
  }
  const removeRoute = async (id) => { if (!confirm('Delete this route?')) return; await api.deleteRoute(id); load() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Routes</h2>
        <form onSubmit={addRoute} className="flex gap-2 items-center">
          <input value={routeId} onChange={(e)=>setRouteId(e.target.value)} placeholder="Route ID" className="border rounded-md px-3 py-2 text-sm"/>
          <input type="number" min={1} value={distanceKm} onChange={(e)=>setDistanceKm(e.target.value)} placeholder="Distance (km)" className="border rounded-md px-3 py-2 text-sm w-36"/>
          <select value={trafficLevel} onChange={(e)=>setTrafficLevel(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <input type="number" min={1} value={baseTime} onChange={(e)=>setBaseTime(e.target.value)} placeholder="Base time (min)" className="border rounded-md px-3 py-2 text-sm w-40"/>
          <button className="bg-black text-white px-3 py-2 rounded-md text-sm">Add</button>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Route ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Distance (km)</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Traffic</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Base Time (min)</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-3 px-4">{r.id}</td>
                <td className="py-3 px-4">
                  {editingId === r.id ? (
                    <input value={edit.route_id} onChange={(e)=>setEdit({...edit, route_id: e.target.value})} className="border rounded-md px-2 py-1 text-sm w-40"/>
                  ) : r.route_id}
                </td>
                <td className="py-3 px-4">
                  {editingId === r.id ? (
                    <input type="number" value={edit.distance_km} onChange={(e)=>setEdit({...edit, distance_km: Number(e.target.value)})} className="border rounded-md px-2 py-1 text-sm w-28"/>
                  ) : r.distance_km}
                </td>
                <td className="py-3 px-4">
                  {editingId === r.id ? (
                    <select value={edit.traffic_level} onChange={(e)=>setEdit({...edit, traffic_level: e.target.value})} className="border rounded-md px-2 py-1 text-sm">
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  ) : r.traffic_level}
                </td>
                <td className="py-3 px-4">
                  {editingId === r.id ? (
                    <input type="number" value={edit.base_time_minutes} onChange={(e)=>setEdit({...edit, base_time_minutes: Number(e.target.value)})} className="border rounded-md px-2 py-1 text-sm w-32"/>
                  ) : r.base_time_minutes}
                </td>
                <td className="py-3 px-4">
                  {editingId === r.id ? (
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(r.id)} className="text-sm bg-black text-white px-3 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="text-sm border px-3 py-1 rounded">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(r)} className="text-sm border px-3 py-1 rounded">Edit</button>
                      <button onClick={()=>removeRoute(r.id)} className="text-sm border px-3 py-1 rounded text-red-600">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!routes.length && (
              <tr><td className="py-6 px-4 text-sm text-gray-500" colSpan={6}>{loading? 'Loading…' : 'No routes found'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RoutesPage


