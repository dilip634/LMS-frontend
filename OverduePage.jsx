import { useEffect, useState } from 'react'
import { circulationAPI } from '../api/index.js'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function OverduePage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)
  const [message, setMessage] = useState('')

  const fetchLoans = async () => {
    setLoading(true)
    try { const res = await circulationAPI.getOverdue(); setLoans(res.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLoans() }, [])

  const payFine = async (loanId) => {
    setPaying(loanId)
    try { const res = await circulationAPI.payFine(loanId); setMessage(res.message); fetchLoans() }
    catch (err) { setMessage(err.message) }
    finally { setPaying(null) }
  }

  const totalFines = loans.reduce((sum, l) => sum + (l.computedFine || 0), 0)

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><div className="page-title">⚠️ Overdue Items</div><div className="page-subtitle">{loans.length} items past due date</div></div>
        {totalFines > 0 && <div className="metric-card" style={{ minWidth: 160 }}><div className="metric-label">Total Fines</div><div className="metric-value metric-danger">₹{totalFines}</div></div>}
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : loans.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">No overdue items</div></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Book</th><th>Patron</th><th>Due Date</th><th>Days Late</th><th>Fine</th><th>Fine Status</th><th>Action</th></tr></thead>
              <tbody>{loans.map((loan) => (
                <tr key={loan._id}>
                  <td><div style={{ fontWeight: 500 }}>{loan.book?.title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.book?.isbn}</div></td>
                  <td><div style={{ fontWeight: 500 }}>{loan.patron?.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.patron?.membershipId}</div></td>
                  <td style={{ color: 'var(--danger)', fontWeight: 500, fontSize: 12 }}>{fmt(loan.dueDate)}</td>
                  <td><span className="badge badge-danger">{loan.daysLate}d</span></td>
                  <td style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{loan.computedFine}</td>
                  <td><span className={`badge ${loan.fine?.paid ? 'badge-success' : 'badge-warning'}`}>{loan.fine?.paid ? 'Paid' : 'Unpaid'}</span></td>
                  <td>{!loan.fine?.paid && <button className="btn btn-success btn-sm" onClick={() => payFine(loan._id)} disabled={paying === loan._id}>{paying === loan._id ? <span className="spinner" /> : '💰 Mark Paid'}</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}