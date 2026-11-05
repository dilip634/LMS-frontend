import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksAPI } from '../api/index.js'

const GENRES = ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Biography', 'Self-help', 'Technology', 'Philosophy', 'Children', 'Other']

export default function BooksPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [available, setAvailable] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search) params.q = search
      if (genre !== 'All') params.genre = genre
      if (available) params.available = true
      const res = await booksAPI.getAll(params)
      setBooks(res.data); setTotal(res.total); setPages(res.pages)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBooks() }, [page, genre, available])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchBooks() }
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this book?')) return
    try { await booksAPI.delete(id); fetchBooks() } catch (err) { alert(err.message) }
  }

  const coverColors = ['#eff6ff', '#f0fdf4', '#fff7ed', '#fdf4ff', '#fefce8', '#f0f9ff']
  const coverEmoji = ['📘', '📗', '📙', '📕', '📒', '📓']

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div><div className="page-title">Books Catalog</div><div className="page-subtitle">{total} books in the library</div></div>
        <button className="btn btn-primary" onClick={() => navigate('/books/add')}>➕ Add Book</button>
      </div>
      <form onSubmit={handleSearch}>
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search by title, author, or ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>
      <div className="filters-row">
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={available} onChange={(e) => { setAvailable(e.target.checked); setPage(1) }} /> Available only
        </label>
        {GENRES.map((g) => <button key={g} className={`filter-chip ${genre === g ? 'active' : ''}`} onClick={() => { setGenre(g); setPage(1) }}>{g}</button>)}
      </div>
      {loading ? <div className="loading-screen"><span className="spinner spinner-lg" /></div> : books.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No books found</div></div>
      ) : (
        <div className="books-grid">
          {books.map((book, i) => (
            <div key={book._id} className="book-card">
              <div className="book-cover" style={{ background: coverColors[i % 6] }}>{coverEmoji[i % 6]}</div>
              <div><div className="book-card-title">{book.title}</div><div className="book-card-author">{book.author} · {book.publishedYear}</div></div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-gray">{book.genre}</span>
                <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>{book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}</span>
              </div>
              <div className="book-card-footer">
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ISBN: {book.isbn}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/books/${book._id}/edit`)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book._id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>)}
          <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  )
}