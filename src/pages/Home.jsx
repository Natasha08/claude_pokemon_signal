import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { currentUser, logout, loading } = useAuth()

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Hello World</h1>
          {currentUser ? (
            <p className="mt-2 text-neutral-700 text-lg">Welcome, {currentUser.username}</p>
          ) : (
            <p className="mt-2 text-neutral-500">Your new favorite app.</p>
          )}
        </div>
        {currentUser ? (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => navigate('/tetris')}>Play Tetris</Button>
            <Button onClick={() => navigate('/drum-machine')}>Drum Machine</Button>
            <Button onClick={() => navigate('/mario')}>Mario</Button>
            <Button variant="outline" onClick={logout}>Log Out</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => navigate('/signup')}>Sign Up</Button>
            <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
          </div>
        )}
      </div>
    </div>
  )
}
