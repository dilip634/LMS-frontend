const getToken = () => localStorage.getItem('lms_token')

const request = async (method, url, body) => {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api${url}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  patch: (url, body) => request('PATCH', url, body),
  delete: (url) => request('DELETE', url),
}

export const authAPI = {
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  me: () => api.get('/auth/me'),
}

export const booksAPI = {
  getAll: (params = {}) => { const q = new URLSearchParams(params).toString(); return api.get(`/books${q ? '?' + q : ''}`) },
  getOne: (id) => api.get(`/books/${id}`),
  create: (body) => api.post('/books', body),
  update: (id, body) => api.patch(`/books/${id}`, body),
  delete: (id) => api.delete(`/books/${id}`),
}

export const membersAPI = {
  getAll: (params = {}) => { const q = new URLSearchParams(params).toString(); return api.get(`/members${q ? '?' + q : ''}`) },
  getOne: (id) => api.get(`/members/${id}`),
  update: (id, body) => api.patch(`/members/${id}`, body),
}

export const circulationAPI = {
  checkout: (body) => api.post('/circulation/checkout', body),
  checkin: (body) => api.post('/circulation/checkin', body),
  getOverdue: () => api.get('/circulation/overdue'),
  getActive: () => api.get('/circulation/active'),
  getHistory: (patronId) => api.get(`/circulation/history/${patronId}`),
  payFine: (loanId) => api.post(`/circulation/fine/${loanId}/pay`),
}

export const reservationsAPI = {
  create: (bookId) => api.post('/reservations', { bookId }),
  getMy: () => api.get('/reservations/my'),
  cancel: (id) => api.delete(`/reservations/${id}`),
}