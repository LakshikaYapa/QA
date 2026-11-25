# Sanitized API Validation Evidence

**Execution date:** 2026-11-25  
**Target:** Local Express API at `http://127.0.0.1:5000`  
**Client:** Node.js built-in HTTP client

The backend was run with a temporary process-only MongoDB URI directed to a TCP listener on `127.0.0.1:27017`. The listener did not implement MongoDB or provide a database; it only kept the backend process available long enough to exercise request validation and authentication middleware. No database operation succeeded and no persistent data was created. A temporary non-production JWT signing value was used only by the local process. No credentials, JWTs, or secrets are recorded here.

| Test reference | Request | Observed response |
|---|---|---|
| F1-13 — registration required fields | `POST /api/auth/register` with required values empty | `400` — `{"message":"All fields are required"}` |
| F1-13 — registration password policy | `POST /api/auth/register` with a synthetic identity and weak password | `400` — `{"message":"Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."}` |
| F1-06 — login required fields | `POST /api/auth/login` with email and password empty | `400` — `{"message":"Email and password are required"}` |
| F1-14 — profile API without token | `GET /api/profile` without an authorization header | `401` — `{"message":"No token provided"}` |
| F1-14 — profile API with invalid token | `GET /api/profile` with a deliberately invalid synthetic bearer token | `401` — `{"message":"Invalid or expired token"}` |

These observations exercise only validation and token rejection that occur before database access. They do not establish successful registration or login, duplicate detection, authenticated profile access, profile persistence, logout, or image upload.
