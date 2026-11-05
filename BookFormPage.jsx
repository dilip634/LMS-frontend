import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { booksAPI } from '../api/index.js'

const GENRES = ['Fiction', 'Non-fiction', 'Science', 'History', 'Biography', 'Self-help', 'Technology', 'Philosophy', 'Children', 'Other']
const empty = { isbn: '', title: '', author: '', genre: 'Fiction', publisher: '', publishedYear: '', totalCopies: 1, description: '' }

export default function BookFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      booksAPI.getOne(id).then((res) => {
        const b = res.data
        setForm({ isbn: b.isbn, title: b.title, author: b.author, genre: b.genre, publisher: b.publisher || '', publishedYear: b.publishedYear || '', totalCopies: b.totalCopies, description: b.description || '' })
      }).finally(() => setFetching(false))
    }
  }, [id])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (isEdit) await booksAPI.update(id, form)
      else await booksAPI.create(form)
      navigate('/books')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (fetching) return <div className="loading-screen"><span className="spinner spinner-lg" /></div>

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">{isEdit ? 'Edit Book' : 'Add New Book'}</div></div>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">ISBN *</label><input className="form-control" name="isbn" value={form.isbn} onChange={handle} required placeholder="9780000000000" /></div>
              <div className="form-group"><label className="form-label">Genre *</label><select className="form-control" name="genre" value={form.genre} onChange={handle}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-control" name="title" value={form.title} onChange={handle} required placeholder="Book title" /></div>
            <div className="form-group"><label className="form-label">Author *</label><input className="form-control" name="author" value={form.author} onChange={handle} required placeholder="Author name" /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Publisher</label><input className="form-control" name="publisher" value={form.publisher} onChange={handle} /></div>
              <div className="form-group"><label className="form-label">Published Year</label><input className="form-control" type="number" name="publishedYear" value={form.publishedYear} onChange={handle} /></div>
            </div>
            <div className="form-group"><label className="form-label">Total Copies *</label><input className="form-control" type="number" name="totalCopies" value={form.totalCopies} onChange={handle} required min="1" /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" name="description" value={form.description} onChange={handle} rows={3} /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/books')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Add Book'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}