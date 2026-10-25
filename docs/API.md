# API quick reference

Base URL (local): `http://localhost:5000/api`

1. `POST /auth/login` body: `{ "email": "priya.sharma@email.com", "password": "Author@123" }`. Copy `data.token` and use it as a Bearer token.
2. `GET /auth/me` returns the current signed-in identity.
3. Author routes: `GET /books/me`, `GET /tickets/me`, `POST /tickets` with `{ "bookId": "BK001" or null, "subject": "...", "description": "..." }`.
4. Admin routes: `GET /tickets?status=Open&priority=High&search=royalty`, `GET /admin/stats`, `GET /tickets/:id`, `PATCH /tickets/:id` with any of `{ "status": "In Progress" }`, `{ "category": "Royalty & Payments" }`, `{ "priority": "High" }`, `POST /tickets/:id/assign`, `POST /tickets/:id/notes` with `{ "body": "Internal-only note" }`, and `POST /tickets/:id/ai-draft`.
5. Add a message using `POST /tickets/:id/messages` with `{ "body": "Reply text" }`. Messages are visible to the ticket owner and admins; internal notes are returned only to admin-facing ticket detail access.

Expected error codes include 400 validation failure, 401 missing/invalid authentication, 403 insufficient role or ticket ownership, 404 missing resource, 409 duplicate record, 429 rate limit, and 500 unexpected server failure.
