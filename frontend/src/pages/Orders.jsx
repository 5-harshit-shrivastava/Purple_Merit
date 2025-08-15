import React, { useEffect, useState } from 'react'
import api from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  // create form
  const [orderId, setOrderId] = useState('')
  const [valueRs, setValueRs] = useState(500)
  const [assignedRoute, setAssignedRoute] = useState('')
  const [deliveryTs, setDeliveryTs] = useState(new Date().toISOString().slice(0,16))
  // edit state
  const [editingId, setEditingId] = useState(null)
  const [edit, setEdit] = useState({ order_id: '', value_rs: 0, assigned_route: '', delivery_timestamp: '' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const addOrder = async (e) => {
    e.preventDefault()
    if (!orderId.trim() || !assignedRoute.trim()) return
    await api.createOrder({ order_id: orderId, value_rs: Number(valueRs), assigned_route: assignedRoute, delivery_timestamp: new Date(deliveryTs).toISOString() })
    setOrderId(''); setValueRs(500); setAssignedRoute(''); setDeliveryTs(new Date().toISOString().slice(0,16))
    load()
  }

  const startEdit = (o) => {
    setEditingId(o.id)
    setEdit({ order_id: o.order_id, value_rs: o.value_rs, assigned_route: o.assigned_route, delivery_timestamp: o.delivery_timestamp?.slice?.(0,16) || '' })
  }
  const cancelEdit = () => setEditingId(null)
  const saveEdit = async (id) => { await api.updateOrder(id, { ...edit, delivery_timestamp: new Date(edit.delivery_timestamp).toISOString() }); cancelEdit(); load() }
  const removeOrder = async (id) => { if (!confirm('Delete this order?')) return; await api.deleteOrder(id); load() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
        <form onSubmit={addOrder} className="flex gap-2 items-center">
          <input value={orderId} onChange={(e)=>setOrderId(e.target.value)} placeholder="Order ID" className="border rounded-md px-3 py-2 text-sm"/>
          <input type="number" min={1} value={valueRs} onChange={(e)=>setValueRs(e.target.value)} placeholder="Value (Rs)" className="border rounded-md px-3 py-2 text-sm w-36"/>
          <input value={assignedRoute} onChange={(e)=>setAssignedRoute(e.target.value)} placeholder="Assigned Route ID" className="border rounded-md px-3 py-2 text-sm"/>
          <input type="datetime-local" value={deliveryTs} onChange={(e)=>setDeliveryTs(e.target.value)} className="border rounded-md px-3 py-2 text-sm"/>
          <button className="bg-black text-white px-3 py-2 rounded-md text-sm">Add</button>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Value (Rs)</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Delivery Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100">
                <td className="py-3 px-4">{o.id}</td>
                <td className="py-3 px-4">
                  {editingId === o.id ? (
                    <input value={edit.order_id} onChange={(e)=>setEdit({...edit, order_id: e.target.value})} className="border rounded-md px-2 py-1 text-sm w-36"/>
                  ) : o.order_id}
                </td>
                <td className="py-3 px-4">
                  {editingId === o.id ? (
                    <input type="number" value={edit.value_rs} onChange={(e)=>setEdit({...edit, value_rs: Number(e.target.value)})} className="border rounded-md px-2 py-1 text-sm w-28"/>
                  ) : o.value_rs}
                </td>
                <td className="py-3 px-4">
                  {editingId === o.id ? (
                    <input value={edit.assigned_route} onChange={(e)=>setEdit({...edit, assigned_route: e.target.value})} className="border rounded-md px-2 py-1 text-sm w-32"/>
                  ) : o.assigned_route}
                </td>
                <td className="py-3 px-4">
                  {editingId === o.id ? (
                    <input type="datetime-local" value={edit.delivery_timestamp} onChange={(e)=>setEdit({...edit, delivery_timestamp: e.target.value})} className="border rounded-md px-2 py-1 text-sm"/>
                  ) : new Date(o.delivery_timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  {editingId === o.id ? (
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(o.id)} className="text-sm bg-black text-white px-3 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="text-sm border px-3 py-1 rounded">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(o)} className="text-sm border px-3 py-1 rounded">Edit</button>
                      <button onClick={()=>removeOrder(o.id)} className="text-sm border px-3 py-1 rounded text-red-600">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr><td className="py-6 px-4 text-sm text-gray-500" colSpan={6}>{loading? 'Loading…' : 'No orders found'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Orders


