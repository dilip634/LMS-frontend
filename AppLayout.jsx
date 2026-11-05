import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { circulationAPI } from '../../api/index.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AppLayout() {
  const { user } = useAuth()
  const [overdueCount, setOverdueCount] = useState(0)

  useEffect(() => {
    if (user?.role === 'librarian') {
      circulationAPI.getOverdue().then((res) => setOverdueCount(res.total)).catch(() => {})
    }
  }, [user])

  return (
    <div className="app-layout">
      <Sidebar overdueCount={overdueCount} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}