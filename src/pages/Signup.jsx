import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!username.trim()) next.username = 'Username is required'
    if (!password.trim()) next.password = 'Password is required'
    else if (password.length < 4) next.password = 'Password must be at least 4 characters'
    else if (password !== confirm) next.confirm = 'Passwords do not match'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    try {
      await signup({ username, password })
      navigate('/')
    } catch (err) {
      setErrors({ form: err.message })
    }
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="scanlines" />
      <div className="grain" />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <div style={{ textAlign: 'center' }}>
          <p className="retro-mono text-glow-cyan" style={{ fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.7 }}>
            New Registration
          </p>
          <h1 className="retro-heading pulse-glow text-glow-red" style={{ fontSize: '2.75rem', margin: 0, lineHeight: 1 }}>
            Identify
          </h1>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, #cc0000, transparent)', boxShadow: '0 0 8px #cc0000' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
          {errors.form && (
            <p className="retro-mono" style={{ color: '#cc0000', fontSize: '0.75rem', textAlign: 'center', textShadow: '0 0 8px #cc0000', letterSpacing: '0.1em' }}>
              {errors.form}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="retro-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,229,255,0.6)' }}>
              Choose Identity
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              style={inputStyle}
            />
            {errors.username && <p style={errorStyle}>{errors.username}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="retro-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,229,255,0.6)' }}>
              Passphrase
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
            {errors.password && <p style={errorStyle}>{errors.password}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="retro-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,229,255,0.6)' }}>
              Confirm Passphrase
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
            {errors.confirm && <p style={errorStyle}>{errors.confirm}</p>}
          </div>

          <button type="submit" className="btn-horror" style={{ marginTop: '0.5rem' }}>
            Register
          </button>
        </form>

        <p className="retro-mono" style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(232,232,224,0.25)', textTransform: 'uppercase' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'rgba(0,229,255,0.5)', textDecoration: 'none', textShadow: '0 0 6px rgba(0,229,255,0.3)' }}
            onMouseEnter={e => e.target.style.color = '#00e5ff'}
            onMouseLeave={e => e.target.style.color = 'rgba(0,229,255,0.5)'}
          >
            Enter
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  background: 'rgba(0,229,255,0.03)',
  border: '1px solid rgba(0,229,255,0.2)',
  color: '#e8e8e0',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
  outline: 'none',
  width: '100%',
  letterSpacing: '0.05em',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const errorStyle = {
  color: '#cc0000',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  textShadow: '0 0 6px #cc0000',
  margin: 0,
}
