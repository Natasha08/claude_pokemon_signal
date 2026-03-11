import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API = '/api/auth'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentUser(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function signup({ name, username, email, password }) {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, username, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setCurrentUser(data.user)
  }

  async function login({ email, password }) {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setCurrentUser(data.user)
  }

  async function logout() {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' })
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
