import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Tetris from './pages/Tetris'
import DrumMachine from './pages/DrumMachine'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/tetris" element={<Tetris />} />
      <Route path="/drum-machine" element={<DrumMachine />} />
    </Routes>
  )
}
