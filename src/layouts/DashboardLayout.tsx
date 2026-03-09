import { Outlet, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(prev => !prev)
  const closeSidebar = () => setSidebarOpen(false)

  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />

  return (
    <div className="dashboard">
      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="main-content">
        <Header onMenuToggle={toggleSidebar} />

        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
