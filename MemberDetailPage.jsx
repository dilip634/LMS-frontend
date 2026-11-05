import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { membersAPI, circulationAPI } from '../api/index.js'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MemberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([membersAPI.getOne(id), circulationAPI.getHistory(id)])
      .then(([m, h]) => { setMember(m.data); setHistory(h.data) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-screen"><span className="spinner spinner-lg" /></div>
  if (!member) return <div className="page"><div className="alert alert-danger">Member not found</div></div>

  const initials = member.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/members')}>← Back</button>
        <div><div className="page-title">Member Profile</div><div className="page-subtitle">{member.membershipId}</div></div>
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>{initials}</div>
              <div><div style={{ fontSize: 18, fontWeight: 700 }}>{member.name}</div><div style={{ color: 'var(--text-secondary)' }}>{member.email}</div></div>
            </div>
            {[['Phone', member.phone || '—'], ['Address', member.address || '—'], ['Joined', fmt(member.createdAt)], ['Status', member.isActive ? '✅ Active' : '❌ Inactive']].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span><span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[{ label: 'Active Loans', value: member.activeLoans, cls: 'metric-accent' }, { label: 'Total Loans', value: member.totalLoans, cls: '' }, { label: 'Unpaid Fines', value: `₹${member.unpaidFines}`, cls: member.unpaidFines > 0 ? 'metric-danger' : 'metric-success' }].map((m) => (
            <div key={m.label} className="metric-card"><div className="metric-label">{m.label}</div><div className={`metric-value ${m.cls}`}>{m.value}</div></div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Borrowing History</span></div>
        {history.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No borrowing history</div></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Book</th><th>Checked Out</th><th>Due Date</th><th>Returned</th><th>Status</th><th>Fine</th></tr></thead>
              <tbody>{history.map((loan) => (
                <tr key={loan._id}>
                  <td><div style={{ fontWeight: 500 }}>{loan.book?.title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.book?.author}</div></td>
                  <td style={{ fontSize: 12 }}>{fmt(loan.checkedOutAt)}</td>
                  <td style={{ fontSize: 12 }}>{fmt(loan.dueDate)}</td>
                  <td style={{ fontSize: 12 }}>{loan.returnedAt ? fmt(loan.returnedAt) : '—'}</td>
                  <td><span className={`badge ${loan.status === 'returned' ? 'badge-success' : loan.status === 'overdue' ? 'badge-danger' : 'badge-accent'}`}>{loan.status}</span></td>
                  <td style={{ color: loan.fine?.amount > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 500 }}>{loan.fine?.amount > 0 ? `₹${loan.fine.amount}` : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}