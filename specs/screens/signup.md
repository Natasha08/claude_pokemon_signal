# Signup

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
