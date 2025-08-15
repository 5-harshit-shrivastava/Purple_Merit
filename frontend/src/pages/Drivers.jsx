import React, { useEffect, useState } from 'react'
import api from '../services/api'

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [status, setStatus] = useState('available')
  const [shiftHours, setShiftHours] = useState(0)
  const [past7Hours, setPast7Hours] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState('available')

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getDrivers()
      setDrivers(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const addDriver = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await api.createDriver({
      name,
      status,
      current_shift_hours: Number(shiftHours) || 0,
      past_7_day_work_hours: Number(past7Hours) || 0
    })
    setName('')
    setStatus('available')
    setShiftHours(0)
    setPast7Hours(0)
    load()
  }

  const startEdit = (driver) => {
    setEditingId(driver.id)
    setEditName(driver.name)
    setEditStatus(driver.status || 'available')
    setEditShiftHours(Number(driver.current_shift_hours) || 0)
    setEditPast7Hours(Number(driver.past_7_day_work_hours) || 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditStatus('available')
    setEditShiftHours(0)
    setEditPast7Hours(0)
  }

  const saveEdit = async (id) => {
    const payload = {
      name: editName,
      status: editStatus,
      current_shift_hours: Number(editShiftHours) || 0,
      past_7_day_work_hours: Number(editPast7Hours) || 0
    }
    await api.updateDriver(id, payload)
    cancelEdit()
    load()
  }

  const removeDriver = async (id) => {
    if (!confirm('Delete this driver?')) return
    await api.deleteDriver(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Drivers</h2>
        <form onSubmit={addDriver} className="flex gap-2 items-center flex-wrap">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Driver name" className="border rounded-md px-3 py-2 text-sm"/>
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="available">available</option>
            <option value="busy">busy</option>
          </select>
          <input type="number" min={0} step="0.25" value={shiftHours} onChange={(e)=>setShiftHours(e.target.value)} placeholder="Current shift hrs" className="border rounded-md px-3 py-2 text-sm w-40"/>
          <input type="number" min={0} step="0.25" value={past7Hours} onChange={(e)=>setPast7Hours(e.target.value)} placeholder="Past 7-day hrs" className="border rounded-md px-3 py-2 text-sm w-40"/>
          <button className="bg-black text-white px-3 py-2 rounded-md text-sm">Add</button>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Current Shift (hrs)</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Past 7-day (hrs)</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d)=> (
              <tr key={d.id} className="border-b border-gray-100">
                <td className="py-3 px-4">{d.id}</td>
                <td className="py-3 px-4">
                  {editingId === d.id ? (
                    <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="border rounded-md px-2 py-1 text-sm w-48" />
                  ) : d.name}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {editingId === d.id ? (
                    <select value={editStatus} onChange={(e)=>setEditStatus(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
                      <option value="available">available</option>
                      <option value="busy">busy</option>
                    </select>
                  ) : (d.status || 'available')}
                </td>
                <td className="py-3 px-4">
                  {editingId === d.id ? (
                    <input type="number" min={0} step="0.25" value={editShiftHours} onChange={(e)=>setEditShiftHours(e.target.value)} className="border rounded-md px-2 py-1 text-sm w-32" />
                  ) : Number(d.current_shift_hours)?.toFixed?.(2) ?? d.current_shift_hours}
                </td>
                <td className="py-3 px-4">
                  {editingId === d.id ? (
                    <input type="number" min={0} step="0.25" value={editPast7Hours} onChange={(e)=>setEditPast7Hours(e.target.value)} className="border rounded-md px-2 py-1 text-sm w-32" />
                  ) : Number(d.past_7_day_work_hours)?.toFixed?.(2) ?? d.past_7_day_work_hours}
                </td>
                <td className="py-3 px-4">
                  {editingId === d.id ? (
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(d.id)} className="text-sm bg-black text-white px-3 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="text-sm border px-3 py-1 rounded">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(d)} className="text-sm border px-3 py-1 rounded">Edit</button>
                      <button onClick={()=>removeDriver(d.id)} className="text-sm border px-3 py-1 rounded text-red-600">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!drivers.length && (
              <tr><td className="py-6 px-4 text-sm text-gray-500" colSpan={6}>{loading? 'Loading…' : 'No drivers found'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Drivers


