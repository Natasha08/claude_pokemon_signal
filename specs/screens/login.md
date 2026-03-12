# Login

Route: `/login`
Purpose: Allows existing users to authenticate.

## Visual style
Matches home page horror/sci-fi aesthetic: dark background, scanlines, grain, red glow title, cyan input labels, monospace font.

Layout:
- Full screen dark background with scanlines + grain overlays
- "Restricted Access" label above title
- Title: "Enter" in Abril Fatface with red pulse-glow
- Glowing red horizontal divider
- "Identity" (username) input
- "Passphrase" (password) input
- "Authenticate" submit button (red primary)
- Link below: "No record? Create identity" → navigates to /signup

Behavior:
- All fields required; show inline error if empty
- On submit: POST /api/auth/login; show form-level error if credentials don't match
- On success: log in the user and navigate to /
