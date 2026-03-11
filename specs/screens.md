# Screens

## Global
- Auth state managed via httpOnly session cookie (set by server)
- No auth data stored in localStorage
- Responsive: works on mobile and desktop

---

## Home / Landing

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
- "Log Out" button (outline style) — calls logout API and returns to logged-out state

Loading state:
- Renders nothing until the `/api/auth/me` check resolves (avoids flash of wrong state)

---

## Login

Route: `/login`
Purpose: Allows existing users to authenticate.

Layout:
- Centered card on full screen
- Title: "Welcome back"
- Email input
- Password input
- Submit button: "Log In"
- Link below: "Don't have an account? Sign up" → navigates to /signup

Behavior:
- All fields required; show inline error if empty
- On submit: POST /api/auth/login; show form-level error if credentials don't match
- On success: log in the user and navigate to /

---

## Signup

Route: `/signup`
Purpose: Allows new users to create an account.

Layout:
- Centered card on full screen
- Title: "Create an account"
- Name input
- Username input
- Email input
- Password input
- Submit button: "Sign Up"
- Link below: "Already have an account? Log in" → navigates to /login

Behavior:
- All fields required; show inline error if empty
- On submit: POST /api/auth/signup; navigate to / on success
- Show form-level error if email or username is already taken
