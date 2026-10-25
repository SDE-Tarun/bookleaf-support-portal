# BookLeaf Author Support & Communication Portal

A full-stack technical-assignment implementation using React, Vite, Tailwind CSS, Express, MongoDB/Mongoose, JWT authentication, and optional OpenAI-assisted ticket classification and reply drafting.

> This assignment is confidential. Keep the repository private and do not publish the assignment or solution publicly.

## Features
- Author login and account-scoped book/ticket data.
- Book catalogue with publication state and royalty fields, including production-stage titles and zero-payout cases.
- Ticket creation, status lifecycle, author/admin replies, admin-only internal notes, assignment, and 10–15 second polling for near-real-time updates.
- AI ticket classification and priority scoring with a deterministic rules fallback when no API key is configured or the provider is unavailable.
- AI response drafting grounded in the assignment's BookLeaf knowledge base, with editable drafts before sending.
- Input validation, consistent JSON errors, JWT auth, role-based access, rate limiting, Helmet security headers, request body limits, and database indexes.
- Responsive layouts for mobile, tablet, and desktop.

## Requirements
- Node.js 20+
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- npm
- Optional OpenAI API key for LLM-assisted classification/drafting

## Local setup
1. Start MongoDB locally or create an Atlas database.
2. In `backend`, copy `.env.example` to `.env`; set `MONGODB_URI` and a random `JWT_SECRET` (at least 32 characters). Never commit `.env`.
3. Install and seed the API:
   ```bash
   cd backend
   npm install
   npm run seed
   npm run dev
   ```
4. In a second terminal, configure and start the frontend:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
5. Open the URL printed by Vite, normally `http://localhost:5173`. API health check: `http://localhost:5000/api/health`.

## Seeded demo credentials
- Admin: `admin@bookleaf.test` / `Admin@123`
- Author: `priya.sharma@email.com` / `Author@123`
- All seeded author accounts use `Author@123` for local evaluation.

The seed script resets the `Author` collection each time it runs. Do not run it against a production database containing real user data.

## AI design
- Model: `gpt-4o-mini` by default, configurable through `OPENAI_MODEL`.
- API key is read only by the backend from `OPENAI_API_KEY`; it is never sent to the browser.
- Classification uses a short ticket subject/description input and constrained JSON output. Category and priority are validated against server-side enums.
- Drafting passes only the ticket fields needed for a response plus a compact knowledge-base policy summary, not the full conversation history or entire database.
- Provider calls use a timeout and limited retry. If the key is absent, the provider fails, or rate limits are encountered, tickets still create successfully using rule-based classification and response templates.
- AI output is a draft/advisory result. Admins can change category/priority and must review/edit replies before sending.

## API overview
All API responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "message": ... } }`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/login` | Public | Email/password login |
| GET | `/api/auth/me` | Signed-in | Current account |
| GET | `/api/books/me` | Author | Own books |
| GET | `/api/tickets/me` | Author | Own tickets |
| POST | `/api/tickets` | Author | Create ticket; AI classification runs best-effort |
| GET | `/api/tickets` | Admin | Ticket queue; filters: `status`, `category`, `priority`, `from`, `to`, `search`, `page`, `limit` |
| GET | `/api/tickets/:id` | Owner or admin | Ticket detail |
| POST | `/api/tickets/:id/messages` | Owner or admin | Add author-visible message |
| PATCH | `/api/tickets/:id` | Admin | Update status/category/priority |
| POST | `/api/tickets/:id/notes` | Admin | Add private internal note |
| POST | `/api/tickets/:id/assign` | Admin | Assign ticket to current admin |
| POST | `/api/tickets/:id/ai-draft` | Admin | Generate a reply draft |
| GET | `/api/admin/stats` | Admin | Queue metrics |

## Testing
- Backend rule classifier tests: `cd backend && npm test`
- API checks with Postman: log in, copy `data.token`, set Bearer Token, then test the routes above.
- Frontend production build: `cd frontend && npm run build`
- Verify author isolation by signing in as one author and trying to fetch another author's ticket ID. The API must reject it.

## Render deployment
Deploy the backend and frontend as separate Render Web Services / Static Site. For the backend use root directory `backend`, build command `npm install`, start command `npm start`. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `OPENAI_API_KEY` (optional), `OPENAI_MODEL`, and `NODE_ENV=production`. For the frontend use root directory `frontend`, build command `npm install && npm run build`, publish directory `dist`, and set `VITE_API_URL` to the deployed backend URL ending in `/api`. Redeploy frontend after setting its environment variable. Seed the production database only once, intentionally, before evaluation; never use a local development URI in production.

## Known limitations / production follow-ups
- Attachments are UI-only as allowed by the assignment; no file is uploaded or stored.
- Near-real-time updates use polling rather than WebSockets/SSE.
- Demo login passwords are intentionally simple for local evaluation. Replace demo credentials, add password reset/invitation flows, audit logging, and stronger account lifecycle controls before real production use.
- Add integration tests for MongoDB-backed auth/ticket flows, pagination UX, and a curated Postman collection before final hand-off.
