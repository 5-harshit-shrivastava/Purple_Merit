import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('demo_manager')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.login({ username, password })
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Login</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <label className="text-sm text-gray-700">Username
          <input value={username} onChange={(e)=>setUsername(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2"/>
        </label>
        <label className="text-sm text-gray-700">Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2"/>
        </label>
        <button className="w-full bg-black text-white px-4 py-2 rounded-md text-sm" disabled={loading}>{loading? 'Signing in…' : 'Login'}</button>
        <p className="text-sm text-gray-600">No account? <Link to="/register" className="underline">Register</Link></p>
      </form>
    </div>
  )
}

export default Login


