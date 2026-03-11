# Home / Landing

Route: `/`
Purpose: Entry point. Shows a welcome message to logged-in users, or lets guests navigate to Login or Signup.

Layout:
- Centered vertically and horizontally on full screen
- App name at top

Logged-out state:
- Tagline below the name
- Two buttons stacked vertically: "Log In" and "Sign Up"
- "Sign Up" navigates to /signup (primary style)
- "Log In" navigates to /login (outline/secondary style)

Logged-in state:
- "Welcome, {username}" message below the name
- "Play Tetris" button (primary) — navigates to /tetris
- "Drum Machine" button (primary) — navigates to /drum-machine
- "Mario" button (primary) — navigates to /mario
- "Log Out" button (outline style) — calls logout API and returns to logged-out state

Loading state:
- Renders nothing until the `/api/auth/me` check resolves (avoids flash of wrong state)
