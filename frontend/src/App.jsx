import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Drivers from './pages/Drivers.jsx'
import RoutesPage from './pages/RoutesPage.jsx'
import Orders from './pages/Orders.jsx'
import Simulation from './pages/Simulation.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="simulation" element={<Simulation />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


