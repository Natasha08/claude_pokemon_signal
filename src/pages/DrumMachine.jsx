import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = 16
const DEFAULT_BPM = 120

const INSTRUMENTS = [
  { id: 'kick',    name: 'Kick',    color: 'bg-orange-500' },
  { id: 'snare',   name: 'Snare',   color: 'bg-blue-500' },
  { id: 'hihat',   name: 'Hi-Hat',  color: 'bg-cyan-500' },
  { id: 'openhat', name: 'Open HH', color: 'bg-teal-400' },
  { id: 'clap',    name: 'Clap',    color: 'bg-purple-500' },
  { id: 'tom',     name: 'Tom',     color: 'bg-green-500' },
]

function initGrid() {
  return Object.fromEntries(INSTRUMENTS.map((i) => [i.id, Array(STEPS).fill(false)]))
}

// -- Sound synthesis --

function makeNoise(ctx, duration) {
  const size = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  return src
}

function playKick(ctx, time) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(150, time)
  osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.4)
  gain.gain.setValueAtTime(1.5, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4)
  osc.start(time)
  osc.stop(time + 0.4)
}

function playSnare(ctx, time) {
  const noise = makeNoise(ctx, 0.2)
  const noiseGain = ctx.createGain()
  noise.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noiseGain.gain.setValueAtTime(1, time)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15)
  noise.start(time)

  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  osc.frequency.setValueAtTime(200, time)
  oscGain.gain.setValueAtTime(0.8, time)
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)
  osc.start(time)
  osc.stop(time + 0.1)
}

function playHihat(ctx, time, open = false) {
  const decay = open ? 0.35 : 0.04
  const noise = makeNoise(ctx, decay)
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 8000
  const gain = ctx.createGain()
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  gain.gain.setValueAtTime(open ? 0.25 : 0.15, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay)
  noise.start(time)
}

function playClap(ctx, time) {
  for (let i = 0; i < 3; i++) {
    const t = time + i * 0.01
    const noise = makeNoise(ctx, 0.05)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1200
    const gain = ctx.createGain()
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.8, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    noise.start(t)
  }
}

function playTom(ctx, time) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(120, time)
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.3)
  gain.gain.setValueAtTime(1, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3)
  osc.start(time)
  osc.stop(time + 0.3)
}

function playSound(ctx, id, time) {
  switch (id) {
    case 'kick':    playKick(ctx, time); break
    case 'snare':   playSnare(ctx, time); break
    case 'hihat':   playHihat(ctx, time, false); break
    case 'openhat': playHihat(ctx, time, true); break
    case 'clap':    playClap(ctx, time); break
    case 'tom':     playTom(ctx, time); break
  }
}

// -- Component --

export default function DrumMachine() {
  const navigate = useNavigate()
  const [grid, setGrid] = useState(initGrid)
  const [playing, setPlaying] = useState(false)
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const [currentStep, setCurrentStep] = useState(null)

  const audioCtxRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const currentStepRef = useRef(0)
  const timerRef = useRef(null)
  const gridRef = useRef(grid)
  const bpmRef = useRef(bpm)

  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  function stepDuration() {
    return (60 / bpmRef.current) / 4 // 16th notes
  }

  function tick() {
    const ctx = audioCtxRef.current
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      const step = currentStepRef.current
      INSTRUMENTS.forEach(({ id }) => {
        if (gridRef.current[id][step]) playSound(ctx, id, nextNoteTimeRef.current)
      })
      setCurrentStep(step)
      nextNoteTimeRef.current += stepDuration()
      currentStepRef.current = (step + 1) % STEPS
    }
    timerRef.current = setTimeout(tick, 25)
  }

  function start() {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    currentStepRef.current = 0
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05
    tick()
    setPlaying(true)
  }

  function stop() {
    clearTimeout(timerRef.current)
    setPlaying(false)
    setCurrentStep(null)
  }

  function toggleCell(id, step) {
    setGrid((g) => ({ ...g, [id]: g[id].map((v, i) => (i === step ? !v : v)) }))
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 2rem' }}>
      <div className="scanlines" />
      <div className="grain" />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '720px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="retro-mono text-glow-red" style={{ fontSize: '0.75rem', letterSpacing: '0.4em', textTransform: 'uppercase', margin: 0 }}>
            Drum Machine
          </h1>
          <button className="btn-horror-ghost" style={{ fontSize: '0.65rem', padding: '0.3rem 0.75rem', width: 'fit-content' }} onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>

        {/* Step grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {INSTRUMENTS.map(({ id, name, color }) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="retro-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(0,229,255,0.5)', width: '3.5rem', textAlign: 'right', flexShrink: 0, textTransform: 'uppercase' }}>{name}</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: STEPS }, (_, step) => (
                  <button
                    key={step}
                    onClick={() => toggleCell(id, step)}
                    className={grid[id][step] ? color : ''}
                    style={{
                      width: 34, height: 34,
                      border: step % 4 === 0 ? '1px solid rgba(204,0,0,0.35)' : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 2,
                      background: grid[id][step] ? undefined : currentStep === step && playing ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.03)',
                      boxShadow: grid[id][step] ? '0 0 6px rgba(255,255,255,0.2)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.05s',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-horror" style={{ width: '5rem', fontSize: '0.75rem', padding: '0.5rem' }} onClick={playing ? stop : start}>
            {playing ? 'Stop' : 'Play'}
          </button>
          <button className="btn-horror-ghost" style={{ fontSize: '0.7rem', padding: '0.5rem 0.75rem', width: 'fit-content' }} onClick={() => { stop(); setGrid(initGrid()) }}>
            Clear
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <span className="retro-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(0,229,255,0.5)' }}>BPM</span>
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              style={{ width: 120, accentColor: '#cc0000' }}
            />
            <span className="retro-mono" style={{ fontSize: '0.8rem', color: '#e8e8e0', textShadow: '0 0 6px rgba(232,232,224,0.3)', width: '2rem' }}>{bpm}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
