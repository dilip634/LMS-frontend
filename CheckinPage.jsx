import { useState, useEffect } from 'react'
import { circulationAPI } from '../api/index.js'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function CheckinPage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(null)

  useEffect(() => { fetchLoans() }, [])

  const fetchLoans = async () => {
    setLoading(true)
    try { const res = await circulationAPI.getActive(); setLoans(res.data) }
    finally { setLoading(false) }
  }

  const handleCheckin = async (loanId) => {
    setProcessing(loanId); setError(''); setResult(null)
    try { const res = await circulationAPI.checkin({ loanId }); setResult(res); fetchLoans() }
    catch (err) { setError(err.message) }
    finally { setProcessing(null) }
  }

  const filtered = loans.filter((l) =>
    l.patron?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.patron?.membershipId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">📥 Check In Book</div><div className="page-subtitle">Process book returns</div></div>
      {result && <div className="alert alert-success">✅ {result.message}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}
      <div className="search-bar">
        <span>🔍</span>
        <input placeholder="Filter by patron name, book title, or membership ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Active Loans ({filtered.length})</span></div>
        {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No active loans found</div></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Book</th><th>Patron</th><th>Checked Out</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{filtered.map((loan) => {
                const isOverdue = loan.status === 'overdue'
                return (
                  <tr key={loan._id}>
                    <td><div style={{ fontWeight: 500 }}>{loan.book?.title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.book?.author}</div></td>
                    <td><div style={{ fontWeight: 500 }}>{loan.patron?.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.patron?.membershipId}</div></td>
                    <td style={{ fontSize: 12 }}>{fmt(loan.checkedOutAt)}</td>
                    <td style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>{fmt(loan.dueDate)}</td>
                    <td><span className={`badge ${isOverdue ? 'badge-danger' : 'badge-accent'}`}>{isOverdue ? '⚠️ Overdue' : '✅ Active'}</span></td>
                    <td><button className="btn btn-success btn-sm" onClick={() => handleCheckin(loan._id)} disabled={processing === loan._id}>{processing === loan._id ? <span className="spinner" /> : '📥 Return'}</button></td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}