# Signup

Route: `/signup`
Purpose: Allows new users to create an account.

## Visual style
Matches home page horror/sci-fi aesthetic: dark background, scanlines, grain, red glow title, cyan input labels, monospace font.

Layout:
- Full screen dark background with scanlines + grain overlays
- "New Registration" label above title
- Title: "Identify" in Abril Fatface with red pulse-glow
- Glowing red horizontal divider
- "Choose Identity" (username) input
- "Passphrase" (password) input, min 4 characters
- "Confirm Passphrase" input
- "Register" submit button (red primary)
- Link below: "Already registered? Enter" → navigates to /login

Behavior:
- All fields required; show inline error if empty
- Password must be at least 4 characters
- Passwords must match; show inline error if they don't
- On submit: POST /api/auth/signup; navigate to / on success
- Show form-level error if username is already taken
