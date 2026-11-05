import { useState } from 'react'
import { booksAPI, membersAPI, circulationAPI } from '../api/index.js'

export default function CheckoutPage() {
  const [bookSearch, setBookSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const searchBooks = async (e) => { e.preventDefault(); const res = await booksAPI.getAll({ q: bookSearch, available: true }); setBooks(res.data) }
  const searchMembers = async (e) => { e.preventDefault(); const res = await membersAPI.getAll({ q: memberSearch }); setMembers(res.data) }

  const handleCheckout = async () => {
    if (!selectedBook || !selectedMember) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await circulationAPI.checkout({ bookId: selectedBook._id, patronId: selectedMember._id })
      setResult(res.data); setSelectedBook(null); setSelectedMember(null); setBooks([]); setMembers([]); setBookSearch(''); setMemberSearch('')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">📤 Check Out Book</div><div className="page-subtitle">Issue a book to a patron</div></div>
      {result && <div className="alert alert-success">✅ <strong>{result.book?.title}</strong> issued to <strong>{result.patron?.name}</strong> — due {fmt(result.dueDate)}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">📚 Select Book</span></div>
          <div className="card-body">
            <form onSubmit={searchBooks} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="form-control" placeholder="Search available books…" value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            {selectedBook && (
              <div style={{ padding: '10px 12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, color: 'var(--accent)' }}>{selectedBook.title}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedBook.author}</div></div>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBook(null)}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {books.map((b) => (
                <div key={b._id} onClick={() => setSelectedBook(b)} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: selectedBook?._id === b._id ? 'var(--accent-light)' : 'var(--bg-card)', borderColor: selectedBook?._id === b._id ? 'var(--accent)' : 'var(--border)' }}>
                  <div style={{ fontWeight: 500 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.author} · {b.availableCopies} available</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">👤 Select Patron</span></div>
          <div className="card-body">
            <form onSubmit={searchMembers} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="form-control" placeholder="Search by name or membership ID…" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            {selectedMember && (
              <div style={{ padding: '10px 12px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, color: 'var(--success)' }}>{selectedMember.name}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedMember.membershipId}</div></div>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMember(null)}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {members.map((m) => (
                <div key={m._id} onClick={() => setSelectedMember(m)} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: selectedMember?._id === m._id ? 'var(--success-light)' : 'var(--bg-card)', borderColor: selectedMember?._id === m._id ? 'var(--success)' : 'var(--border)' }}>
                  <div style={{ fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.membershipId} · {m.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedBook && selectedMember && (
        <div className="card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ fontSize: 14 }}>Issue <strong>{selectedBook.title}</strong> to <strong>{selectedMember.name}</strong> — due in 14 days</div>
            <button className="btn btn-primary btn-lg" onClick={handleCheckout} disabled={loading}>{loading ? <span className="spinner" /> : '📤 Confirm Checkout'}</button>
          </div>
        </div>
      )}
    </div>
  )
}