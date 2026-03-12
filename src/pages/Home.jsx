import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const GAMES = [
  { label: 'Tetris',       path: '/tetris' },
  { label: 'Drum Machine', path: '/drum-machine' },
  { label: 'Mario',        path: '/mario' },
  { label: 'Pixel Art',    path: '/pixel-art' },
]

export default function Home() {
  const navigate = useNavigate()
  const { currentUser, logout, loading } = useAuth()

  if (loading) return null

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {/* Overlays */}
      <div className="scanlines" />
      <div className="grain" />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', width: '100%', maxWidth: '360px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <p className="retro-mono text-glow-cyan" style={{ fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '0.75rem', opacity: 0.8 }}>
            System Online
          </p>
          <h1
            className="retro-heading flicker pulse-glow text-glow-red"
            style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', lineHeight: 1, margin: 0 }}
          >
            Hello World
          </h1>
          <div style={{ marginTop: '1rem' }}>
            {currentUser ? (
              <p className="retro-mono text-glow-white" style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.7 }}>
                Welcome back, <span className="text-glow-cyan">{currentUser.username}</span>
              </p>
            ) : (
              <p className="retro-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(232,232,224,0.35)', textTransform: 'uppercase' }}>
                Identify yourself
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, #cc0000, transparent)', boxShadow: '0 0 8px #cc0000' }} />

        {/* Buttons */}
        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            {GAMES.map(g => (
              <button key={g.path} className="btn-horror" onClick={() => navigate(g.path)}>
                {g.label}
              </button>
            ))}
            <div style={{ marginTop: '0.5rem' }}>
              <button className="btn-horror-ghost" onClick={logout}>
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button className="btn-horror" onClick={() => navigate('/signup')}>
              New Identity
            </button>
            <button className="btn-horror-ghost" onClick={() => navigate('/login')}>
              Enter
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="retro-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,229,255,0.2)', textTransform: 'uppercase' }}>
          © 1987 — All rights reserved
        </p>

      </div>
    </div>
  )
}
