# Home / Landing

Route: `/`
Purpose: Entry point. Shows a welcome message to logged-in users, or lets guests navigate to Login or Signup.

## Visual style
1980s horror/sci-fi aesthetic: near-black background (#0a0a0f), deep red (#cc0000) primary accent with glow, cyan secondary accent, CRT scanline overlay, film grain at 8% opacity, Abril Fatface heading font, Share Tech Mono body font.

## Boot sequence
On page load, a terminal boot sequence types out line by line before the main UI fades in:
- BIOS v2.31 // SIGNAL CORP.
- MEMORY CHECK............ OK
- NETWORK INTERFACE....... OK
- ORIGIN UNKNOWN
- USER DETECTED
- > LOADING INTERFACE_

## Layout
- Fake system readouts (coordinates, signal strength, uptime) at top in dim cyan
- "Signal Detected" label above title
- Title: "SIGNAL" in Abril Fatface with flicker + glitch + red pulse-glow animation
- Blinking cursor (█) after tagline
- Glowing red horizontal divider
- Buttons stacked vertically
- "© 1987 — ALL RIGHTS RESERVED — DO NOT TRANSMIT" footer

## States

Logged-out:
- Tagline: "Unknown origin █"
- "New Identity" button (red, primary) → /signup
- "Enter" button (cyan ghost) → /login

Logged-in:
- Tagline: "Identity confirmed — {username} █"
- Game buttons (red primary): Tetris, Drum Machine, Mario, Pixel Art
- "Disconnect" button (cyan ghost) — calls logout

Loading:
- Renders nothing until `/api/auth/me` resolves
