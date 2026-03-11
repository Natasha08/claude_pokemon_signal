import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-10">
      <div className="flex flex-col gap-6 w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold tracking-tight">Drum Machine</h1>
          <Button
            size="sm"
            variant="outline"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white bg-transparent"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </div>

        {/* Step grid */}
        <div className="flex flex-col gap-2">
          {INSTRUMENTS.map(({ id, name, color }) => (
            <div key={id} className="flex items-center gap-3">
              <span className="text-neutral-400 text-xs w-14 text-right shrink-0">{name}</span>
              <div className="flex gap-1">
                {Array.from({ length: STEPS }, (_, step) => (
                  <button
                    key={step}
                    onClick={() => toggleCell(id, step)}
                    className={[
                      'w-9 h-9 rounded-sm border transition-colors',
                      step % 4 === 0 ? 'border-neutral-600' : 'border-neutral-700',
                      grid[id][step]
                        ? `${color} border-transparent`
                        : currentStep === step && playing
                          ? 'bg-neutral-700'
                          : 'bg-neutral-800 hover:bg-neutral-700',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button className="w-20" onClick={playing ? stop : start}>
            {playing ? 'Stop' : 'Play'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white bg-transparent"
            onClick={() => { stop(); setGrid(initGrid()) }}
          >
            Clear
          </Button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-neutral-400 text-sm">BPM</span>
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-32 accent-white"
            />
            <span className="text-white font-mono text-sm w-8">{bpm}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
