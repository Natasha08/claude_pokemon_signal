# Signup

Route: `/signup`
Purpose: Allows new users to create an account.

Layout:
- Centered card on full screen
- Title: "Create an account"
- Username input
- Password input (min 4 characters)
- Confirm Password input
- Submit button: "Sign Up"
- Link below: "Already have an account? Log in" → navigates to /login

Behavior:
- All fields required; show inline error if empty
- Password must be at least 4 characters
- Passwords must match; show inline error if they don't
- On submit: POST /api/auth/signup; navigate to / on success
- Show form-level error if username is already taken
