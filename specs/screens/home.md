# Home / Landing

Route: `/`
Purpose: Entry point. Shows a welcome message to logged-in users, or lets guests navigate to Login or Signup.

## Visual style
1980s horror/sci-fi aesthetic: near-black background (#0a0a0f), deep red (#cc0000) primary accent with glow, cyan secondary accent, CRT scanline overlay, film grain at 8% opacity, Abril Fatface heading font, Share Tech Mono body font.

Layout:
- Full screen dark background with scanlines + grain overlays
- "System Online" label above title
- App name "Hello World" in Abril Fatface with flicker + red pulse-glow animation
- Glowing red horizontal divider
- Buttons stacked vertically
- "© 1987" footer

Logged-out state:
- Tagline: "Identify yourself"
- "New Identity" button (red, primary) → navigates to /signup
- "Enter" button (cyan ghost) → navigates to /login

Logged-in state:
- "Welcome back, {username}" with cyan username
- "Tetris", "Drum Machine", "Mario" buttons (red primary)
- "Disconnect" button (cyan ghost) — calls logout

Loading state:
- Renders nothing until the `/api/auth/me` check resolves
