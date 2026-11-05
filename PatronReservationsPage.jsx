import { useEffect, useState } from 'react'
import { reservationsAPI } from '../api/index.js'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function PatronReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [message, setMessage] = useState('')

  const fetchRes = async () => {
    setLoading(true)
    try { const res = await reservationsAPI.getMy(); setReservations(res.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRes() }, [])

  const cancel = async (id) => {
    setCancelling(id)
    try { await reservationsAPI.cancel(id); setMessage('Reservation cancelled'); fetchRes() }
    catch (err) { setMessage(err.message) }
    finally { setCancelling(null) }
  }

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">🔖 My Reservations</div><div className="page-subtitle">Books you've placed on hold</div></div>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : reservations.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔖</div><div className="empty-state-title">No reservations</div><div className="empty-state-text">Reserve unavailable books from the Browse page</div></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Book</th><th>Author</th><th>Genre</th><th>Reserved On</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{reservations.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 500 }}>{r.book?.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.book?.author}</td>
                  <td><span className="badge badge-gray">{r.book?.genre}</span></td>
                  <td style={{ fontSize: 12 }}>{fmt(r.createdAt)}</td>
                  <td><span className={`badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'fulfilled' ? 'badge-success' : 'badge-gray'}`}>{r.status}</span></td>
                  <td>{r.status === 'pending' && <button className="btn btn-danger btn-sm" onClick={() => cancel(r._id)} disabled={cancelling === r._id}>{cancelling === r._id ? <span className="spinner" /> : 'Cancel'}</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}