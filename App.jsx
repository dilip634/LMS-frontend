import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AppLayout from './components/common/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BooksPage from './pages/BooksPage.jsx'
import BookFormPage from './pages/BookFormPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import MemberDetailPage from './pages/MemberDetailPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CheckinPage from './pages/CheckinPage.jsx'
import OverduePage from './pages/OverduePage.jsx'
import PatronBrowsePage from './pages/PatronBrowsePage.jsx'
import { PatronReservationsPage } from './pages/PatronReservationsPage.jsx'
import PatronHistoryPage from './pages/PatronHistoryPage.jsx'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner spinner-lg" /> Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'librarian' ? '/dashboard' : '/patron'} replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner spinner-lg" /> Loading…</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'librarian' ? '/dashboard' : '/patron'} replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute role="librarian"><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/add" element={<BookFormPage />} />
        <Route path="/books/:id/edit" element={<BookFormPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<MemberDetailPage />} />
        <Route path="/circulation/checkout" element={<CheckoutPage />} />
        <Route path="/circulation/checkin" element={<CheckinPage />} />
        <Route path="/circulation/overdue" element={<OverduePage />} />
      </Route>
      <Route element={<ProtectedRoute role="patron"><AppLayout /></ProtectedRoute>}>
        <Route path="/patron" element={<PatronBrowsePage />} />
        <Route path="/patron/reservations" element={<PatronReservationsPage />} />
        <Route path="/patron/history" element={<PatronHistoryPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}