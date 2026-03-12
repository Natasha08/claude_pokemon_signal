# Drum Machine

Route: `/drum-machine`
Purpose: A 16-step drum sequencer with synthesized sounds, accessible only when logged in.

## Visual style
Matches app horror/sci-fi aesthetic: dark background (#0a0a0f), scanlines + grain overlays, cyan retro-mono labels, red horror-style Play/Stop button, red accent color on BPM slider.

Layout:
- Dark full-screen background
- Header with title and Home button
- Step grid: 6 instrument rows × 16 step buttons
- Controls row below the grid: Play/Stop, Clear, BPM slider

Instruments:
- Kick (orange)
- Snare (blue)
- Hi-Hat (cyan)
- Open HH (teal)
- Clap (purple)
- Tom (green)

Grid:
- Each cell toggles on/off on click
- Active cells show the instrument's color
- The current playing step is highlighted as the playhead moves
- Steps are grouped visually in sets of 4 (beat divisions)

Sounds:
- All sounds synthesized via the Web Audio API (no audio files)
- Kick: oscillator with pitch drop
- Snare: white noise + oscillator
- Hi-Hat: filtered white noise, short decay
- Open HH: filtered white noise, longer decay
- Clap: layered bandpass noise bursts
- Tom: oscillator with pitch drop

Controls:
- Play/Stop: starts or stops the sequencer
- Clear: stops playback and resets all steps
- BPM: range slider from 60–200 (default 120), adjustable while playing

Home:
- "Home" button in the header navigates back to /
