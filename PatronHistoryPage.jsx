import { useEffect, useState } from 'react'
import { circulationAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PatronHistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id || user?._id) {
      circulationAPI.getHistory(user._id).then((res) => setHistory(res.data)).finally(() => setLoading(false))
    }
  }, [user])

  const active = history.filter((l) => l.status !== 'returned').length
  const unpaid = history.filter((l) => l.fine?.amount > 0 && !l.fine?.paid).reduce((sum, l) => sum + l.fine.amount, 0)

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">📋 Borrowing History</div><div className="page-subtitle">Your complete loan record</div></div>
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card"><div className="metric-label">📚 Total Borrowed</div><div className="metric-value">{history.length}</div></div>
        <div className="metric-card"><div className="metric-label">📤 Currently Out</div><div className="metric-value metric-accent">{active}</div></div>
        <div className="metric-card"><div className="metric-label">💰 Unpaid Fines</div><div className={`metric-value ${unpaid > 0 ? 'metric-danger' : 'metric-success'}`}>₹{unpaid}</div></div>
      </div>
      <div className="card">
        {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : history.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No borrowing history yet</div></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Book</th><th>Checked Out</th><th>Due Date</th><th>Returned</th><th>Status</th><th>Fine</th></tr></thead>
              <tbody>{history.map((loan) => (
                <tr key={loan._id}>
                  <td><div style={{ fontWeight: 500 }}>{loan.book?.title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.book?.author}</div></td>
                  <td style={{ fontSize: 12 }}>{fmt(loan.checkedOutAt)}</td>
                  <td style={{ fontSize: 12, color: loan.status === 'overdue' ? 'var(--danger)' : 'inherit' }}>{fmt(loan.dueDate)}</td>
                  <td style={{ fontSize: 12 }}>{loan.returnedAt ? fmt(loan.returnedAt) : '—'}</td>
                  <td><span className={`badge ${loan.status === 'returned' ? 'badge-success' : loan.status === 'overdue' ? 'badge-danger' : 'badge-accent'}`}>{loan.status}</span></td>
                  <td>{loan.fine?.amount > 0 ? <span className={`badge ${loan.fine.paid ? 'badge-success' : 'badge-danger'}`}>₹{loan.fine.amount} {loan.fine.paid ? '✓' : '!'}</span> : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}