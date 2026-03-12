import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

const GAMES = [
  { label: 'Tetris',       path: '/tetris' },
  { label: 'Drum Machine', path: '/drum-machine' },
  { label: 'Mario',        path: '/mario' },
  { label: 'Pixel Art',    path: '/pixel-art' },
]

const BOOT_LINES = [
  'BIOS v2.31 // SIGNAL CORP.',
  'MEMORY CHECK............ OK',
  'NETWORK INTERFACE....... OK',
  'ORIGIN UNKNOWN',
  'USER DETECTED',
  '> LOADING INTERFACE_',
]

const READOUTS = [
  'LAT 40.7° // LONG -74.0°',
  'SIGNAL STRENGTH: ████░░ 71%',
  'UPTIME: 13,847 HRS',
]

export default function Home() {
  const navigate = useNavigate()
  const { currentUser, logout, loading } = useAuth()
  const [booting, setBooting] = useState(true)
  const [visibleLines, setVisibleLines] = useState([])
  const [mainVisible, setMainVisible] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setVisibleLines(prev => [...prev, BOOT_LINES[i]])
      i++
      if (i >= BOOT_LINES.length) {
        clearInterval(interval)
        setTimeout(() => {
          setBooting(false)
          setTimeout(() => setMainVisible(true), 100)
        }, 600)
      }
    }, 320)
    return () => clearInterval(interval)
  }, [])

  if (loading) return null

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="scanlines" />
      <div className="grain" />

      {/* Boot sequence */}
      {booting && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {visibleLines.map((line, i) => (
            <p key={i} className="retro-mono" style={{ margin: 0, fontSize: '0.75rem', letterSpacing: '0.1em', color: i === visibleLines.length - 1 ? '#00e5ff' : 'rgba(232,232,224,0.45)', textShadow: i === visibleLines.length - 1 ? '0 0 8px #00e5ff' : 'none' }}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Main UI */}
      {!booting && (
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', width: '100%', maxWidth: '360px', opacity: mainVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>

          {/* Readouts */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {READOUTS.map((r, i) => (
              <p key={i} className="retro-mono" style={{ margin: 0, fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(0,229,255,0.3)' }}>{r}</p>
            ))}
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <p className="retro-mono text-glow-cyan" style={{ fontSize: '0.65rem', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: '0.75rem', opacity: 0.7 }}>
              Signal Detected
            </p>
            <h1
              className="retro-heading flicker pulse-glow text-glow-red glitch"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)', lineHeight: 1, margin: 0 }}
              data-text="SIGNAL"
            >
              SIGNAL
            </h1>
            <div style={{ marginTop: '1rem', minHeight: '1.5rem' }}>
              {currentUser ? (
                <p className="retro-mono text-glow-white" style={{ fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.6 }}>
                  Identity confirmed — <span className="text-glow-cyan">{currentUser.username}</span>
                  <span className="blink-cursor"> █</span>
                </p>
              ) : (
                <p className="retro-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(232,232,224,0.3)', textTransform: 'uppercase' }}>
                  Unknown origin<span className="blink-cursor"> █</span>
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
          <p className="retro-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(0,229,255,0.15)', textTransform: 'uppercase' }}>
            © 1987 — ALL RIGHTS RESERVED — DO NOT TRANSMIT
          </p>

        </div>
      )}
    </div>
  )
}
