# API

Base path: `/api/auth`

## Auth flow
- On app load, the frontend calls `GET /api/auth/me` to restore the session from the httpOnly cookie
- Signup and Login hit the API, which sets the session cookie on success
- Logout calls `POST /api/auth/logout`, which clears the cookie

## Routes

| Method | Path              | Description                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | /api/auth/me      | Returns the current user from the session cookie |
| POST   | /api/auth/signup  | Creates a user, sets session cookie              |
| POST   | /api/auth/login   | Authenticates a user, sets session cookie        |
| POST   | /api/auth/logout  | Clears the session cookie                        |

## Request / response shapes

### POST /api/auth/signup
```json
{ "name": "", "username": "", "email": "", "password": "" }
```

### POST /api/auth/login
```json
{ "email": "", "password": "" }
```

### Success response (signup / login / me)
```json
{ "user": { "id": 1, "name": "", "username": "", "email": "" } }
```

### Error response
```json
{ "error": "Human-readable message" }
```
