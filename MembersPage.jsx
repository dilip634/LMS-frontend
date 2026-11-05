import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { membersAPI } from '../api/index.js'

export default function MembersPage() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const fetchMembers = async (q = search, p = page) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 15 }
      if (q) params.q = q
      const res = await membersAPI.getAll(params)
      setMembers(res.data); setTotal(res.total); setPages(res.pages)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMembers() }, [page])

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const initials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarColors = ['#eff6ff', '#f0fdf4', '#fff7ed', '#fdf4ff', '#fefce8']
  const textColors = ['#1d4ed8', '#15803d', '#c2410c', '#7c3aed', '#a16207']

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Members</div><div className="page-subtitle">{total} registered patrons</div></div>
      <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchMembers(search, 1) }}>
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search by name, email, or membership ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : members.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No members found</div></div>
          ) : (
            <table>
              <thead><tr><th>Member</th><th>Membership ID</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>{members.map((m, i) => (
                <tr key={m._id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: avatarColors[i % 5], color: textColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{initials(m.name)}</div>
                    <div><div style={{ fontWeight: 500 }}>{m.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div></div>
                  </div></td>
                  <td><code style={{ fontSize: 12, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{m.membershipId}</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.phone || '—'}</td>
                  <td><span className={`badge ${m.isActive ? 'badge-success' : 'badge-danger'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmt(m.createdAt)}</td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/members/${m._id}`)}>View</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        {pages > 1 && <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>)}
          <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>}
      </div>
    </div>
  )
}