import { useEffect, useState } from 'react'
import { booksAPI, reservationsAPI } from '../api/index.js'

const GENRES = ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Biography', 'Self-help', 'Technology', 'Philosophy', 'Children', 'Other']

export default function PatronBrowsePage() {
  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [reserving, setReserving] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search) params.q = search
      if (genre !== 'All') params.genre = genre
      const res = await booksAPI.getAll(params)
      setBooks(res.data); setTotal(res.total); setPages(res.pages)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBooks() }, [page, genre])

  const handleReserve = async (bookId) => {
    setReserving(bookId); setMessage(''); setError('')
    try { await reservationsAPI.create(bookId); setMessage('Reservation placed successfully!') }
    catch (err) { setError(err.message) }
    finally { setReserving(null) }
  }

  const coverColors = ['#eff6ff', '#f0fdf4', '#fff7ed', '#fdf4ff', '#fefce8', '#f0f9ff']
  const coverEmoji = ['📘', '📗', '📙', '📕', '📒', '📓']

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">📚 Browse Books</div><div className="page-subtitle">{total} books in the library</div></div>
      {message && <div className="alert alert-success">✅ {message}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchBooks() }}>
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search by title, author, or ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>
      <div className="filters-row">{GENRES.map((g) => <button key={g} className={`filter-chip ${genre === g ? 'active' : ''}`} onClick={() => { setGenre(g); setPage(1) }}>{g}</button>)}</div>
      {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : books.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No books found</div></div>
      ) : (
        <div className="books-grid">
          {books.map((book, i) => (
            <div key={book._id} className="book-card">
              <div className="book-cover" style={{ background: coverColors[i % 6] }}>{coverEmoji[i % 6]}</div>
              <div><div className="book-card-title">{book.title}</div><div className="book-card-author">{book.author}</div></div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-gray">{book.genre}</span>
                <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>{book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}</span>
              </div>
              {book.availableCopies === 0 && <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => handleReserve(book._id)} disabled={reserving === book._id}>{reserving === book._id ? <span className="spinner" /> : '🔖 Reserve'}</button>}
            </div>
          ))}
        </div>
      )}
      {pages > 1 && <div className="pagination">
        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>)}
        <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
      </div>}
    </div>
  )
}