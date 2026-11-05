import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const LibrarianNav = ({ overdueCount }) => (
  <>
    <div className="sidebar-section-label">Overview</div>
    <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">🏠</span> Dashboard
    </NavLink>
    <div className="sidebar-section-label">Catalog</div>
    <NavLink to="/books" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">📚</span> Books
    </NavLink>
    <NavLink to="/books/add" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">➕</span> Add Book
    </NavLink>
    <div className="sidebar-section-label">Members</div>
    <NavLink to="/members" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">👥</span> All Members
    </NavLink>
    <div className="sidebar-section-label">Circulation</div>
    <NavLink to="/circulation/checkout" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">📤</span> Check Out
    </NavLink>
    <NavLink to="/circulation/checkin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">📥</span> Check In
    </NavLink>
    <NavLink to="/circulation/overdue" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">⚠️</span> Overdue
      {overdueCount > 0 && <span className="sidebar-badge warn">{overdueCount}</span>}
    </NavLink>
  </>
)

const PatronNav = () => (
  <>
    <div className="sidebar-section-label">Library</div>
    <NavLink to="/patron" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">🔍</span> Browse Books
    </NavLink>
    <NavLink to="/patron/reservations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">🔖</span> My Reservations
    </NavLink>
    <NavLink to="/patron/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <span className="sidebar-link-icon">📋</span> Borrow History
    </NavLink>
  </>
)

export default function Sidebar({ overdueCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">📚</div>
        <div className="sidebar-brand-name">LibraryOS</div>
        <div className="sidebar-brand-sub">Management System</div>
      </div>
      <nav className="sidebar-nav">
        {user?.role === 'librarian' ? <LibrarianNav overdueCount={overdueCount} /> : <PatronNav />}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>🚪 Sign out</button>
      </div>
    </aside>
  )
}