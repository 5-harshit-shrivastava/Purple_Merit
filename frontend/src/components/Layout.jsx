import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LogOut, User, LayoutDashboard, Users, Route as RouteIcon, Package, Play } from 'lucide-react'

const Layout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg grid place-items-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">LogiDash</h1>
          </div>
          <nav className="hidden md:flex items-center gap-5">
            <NavLink to="/" className={({isActive}) => `text-sm inline-flex items-center gap-2 ${isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}><LayoutDashboard className="w-4 h-4"/> Dashboard</NavLink>
            <NavLink to="/drivers" className={({isActive}) => `text-sm inline-flex items-center gap-2 ${isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}><Users className="w-4 h-4"/> Drivers</NavLink>
            <NavLink to="/routes" className={({isActive}) => `text-sm inline-flex items-center gap-2 ${isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}><RouteIcon className="w-4 h-4"/> Routes</NavLink>
            <NavLink to="/orders" className={({isActive}) => `text-sm inline-flex items-center gap-2 ${isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}><Package className="w-4 h-4"/> Orders</NavLink>
            <NavLink to="/simulation" className={({isActive}) => `text-sm inline-flex items-center gap-2 ${isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}><Play className="w-4 h-4"/> Simulation</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.username || 'demo_manager'}</span>
            </div>
            <button onClick={handleLogout} className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm inline-flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout


