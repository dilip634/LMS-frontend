import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksAPI, membersAPI, circulationAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ books: 0, members: 0, active: 0, overdue: 0 })
  const [recentBooks, setRecentBooks] = useState([])
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      booksAPI.getAll({ limit: 5 }),
      membersAPI.getAll({ limit: 1 }),
      circulationAPI.getActive(),
      circulationAPI.getOverdue(),
    ]).then(([books, members, active, overdueRes]) => {
      setStats({ books: books.total, members: members.total, active: active.total, overdue: overdueRes.total })
      setRecentBooks(books.data.slice(0, 5))
      setOverdue(overdueRes.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-screen"><span className="spinner spinner-lg" /> Loading…</div>

  const coverEmoji = ['📘', '📗', '📙', '📕', '📒']

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">Welcome back, {user?.name}</div>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><div className="metric-label">📚 Total Books</div><div className="metric-value metric-accent">{stats.books}</div><div className="metric-sub">in catalog</div></div>
        <div className="metric-card"><div className="metric-label">👥 Active Members</div><div className="metric-value metric-success">{stats.members}</div><div className="metric-sub">registered patrons</div></div>
        <div className="metric-card"><div className="metric-label">📤 Checked Out</div><div className="metric-value">{stats.active}</div><div className="metric-sub">active loans</div></div>
        <div className="metric-card"><div className="metric-label">⚠️ Overdue</div><div className={`metric-value ${stats.overdue > 0 ? 'metric-danger' : ''}`}>{stats.overdue}</div><div className="metric-sub">items past due</div></div>
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">📚 Recent Books</span><button className="btn btn-secondary btn-sm" onClick={() => navigate('/books')}>View all</button></div>
          <div className="table-wrapper">
            <table><thead><tr><th>Title</th><th>Author</th><th>Copies</th></tr></thead>
              <tbody>{recentBooks.map((b, i) => (
                <tr key={b._id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>{coverEmoji[i % 5]}</span><span style={{ fontWeight: 500 }}>{b.title}</span></div></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{b.author}</td>
                  <td><span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>{b.availableCopies}/{b.totalCopies}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">⚠️ Overdue Items</span><button className="btn btn-secondary btn-sm" onClick={() => navigate('/circulation/overdue')}>View all</button></div>
          {overdue.length === 0 ? <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">No overdue items</div></div> : (
            <div className="table-wrapper">
              <table><thead><tr><th>Patron</th><th>Book</th><th>Days Late</th><th>Fine</th></tr></thead>
                <tbody>{overdue.map((loan) => (
                  <tr key={loan._id}>
                    <td style={{ fontWeight: 500 }}>{loan.patron?.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{loan.book?.title}</td>
                    <td><span className="badge badge-danger">{loan.daysLate}d</span></td>
                    <td style={{ color: 'var(--danger)', fontWeight: 500 }}>₹{loan.computedFine}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">⚡ Quick Actions</span></div>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/circulation/checkout')}>📤 Check Out Book</button>
          <button className="btn btn-secondary" onClick={() => navigate('/circulation/checkin')}>📥 Check In Book</button>
          <button className="btn btn-secondary" onClick={() => navigate('/books/add')}>➕ Add New Book</button>
          <button className="btn btn-secondary" onClick={() => navigate('/members')}>👥 View Members</button>
        </div>
      </div>
    </div>
  )
}