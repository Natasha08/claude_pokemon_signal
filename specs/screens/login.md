# Login

Route: `/login`
Purpose: Allows existing users to authenticate.

Layout:
- Centered card on full screen
- Title: "Welcome back"
- Username input
- Password input
- Submit button: "Log In"
- Link below: "Don't have an account? Sign up" → navigates to /signup

Behavior:
- All fields required; show inline error if empty
- On submit: POST /api/auth/login; show form-level error if credentials don't match
- On success: log in the user and navigate to /
