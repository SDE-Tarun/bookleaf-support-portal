# BookLeaf Author Support & Communication Portal

## Project Overview

The BookLeaf Author Support Portal is a full-stack web application that helps authors submit support requests and enables the operations team to manage tickets, prioritise issues, and respond consistently. It includes separate author and admin experiences with role-based access control.

## Live Demo

- **Frontend:** https://bookleaf-support-portal-frontend.onrender.com
- **Backend health:** https://bookleaf-support-portal-n3a7.onrender.com/api/health
- **Source code:** https://github.com/SDE-Tarun/bookleaf-support-portal

## Demo Credentials

**Admin**
- Email: `admin@bookleaf.test`
- Password: `Admin@123`

**Author**
- Email: `priya.sharma@email.com`
- Password: `Author@123`

These are seeded demonstration accounts. The repository should remain private as required by the assignment.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT and role-based access control
- **AI assistance:** AI classification and response-drafting workflow with rule-based/template fallback
- **Deployment:** Render

## Key Features

- Author login and author-specific book and ticket views
- Support ticket creation with book selection
- Ticket categorisation and priority assignment
- Admin ticket queue, filters, assignment and status management
- Admin replies and private internal notes
- AI-assisted response drafts requiring human review
- Near-real-time author ticket updates through polling
- Input validation, access-control checks and consistent API errors

## Architecture Decisions

The application separates the React frontend, Express REST API, and MongoDB persistence layer. Controllers handle request workflows, middleware handles authentication and authorisation, and services encapsulate classification and response-drafting logic. This separation keeps the code easier to maintain and test.

JWT authentication protects private routes. Authors can access only their own records and tickets, while admin-only operations are protected by role checks. Polling was chosen for near-real-time updates because it is straightforward to implement and sufficient for this assignment’s scale.

## AI Integration and Reliability

Ticket classification and response drafting are designed to assist support staff rather than replace their judgement. Response drafts use BookLeaf policy context and a consistent support tone. Drafts should be reviewed and sent by an admin; they should not be treated as authoritative without verification.

When a live AI provider is not configured or unavailable, the application can fall back to rule-based classification and template responses so the support workflow remains usable. The current demo uses the fallback path when no provider API key is configured. Provider credentials belong in backend environment variables, never in frontend code.

## Local Setup

1. Install Node.js and MongoDB, or configure a MongoDB Atlas database.
2. Install backend dependencies from `backend/` using `npm install`.
3. Configure the backend `.env` using `backend/.env.example`.
4. Run the seed script only against a development or intended demo database: `npm run seed`.
5. Start the backend using the command defined in `backend/package.json`.
6. Install frontend dependencies from `frontend/` using `npm install`.
7. Configure `VITE_API_URL` to point to the backend API base URL.
8. Start the frontend using `npm run dev`.

Do not run the seed script against a database containing data you need to preserve: it clears ticket and author records before inserting demo data.

## API Documentation

See [`docs/API.md`](docs/API.md) for endpoint details and authentication requirements. See [`docs/APPROACH.md`](docs/APPROACH.md) for the implementation approach and trade-offs.

## Tests

The backend classifier tests and frontend production build have passed. Manual testing has also verified author/admin login, ticket creation, admin queue visibility, status and priority updates, assignment, replies, and role-based access restrictions.

## Known Limitations and Future Improvements

- File attachment upload is UI-only.
- Live AI drafting requires provider credentials; the deployed demo currently uses fallback behaviour when no key is configured.
- Polling is used instead of WebSockets or Server-Sent Events.
- Production hardening could include password-management flows, audit logging, monitoring, automated end-to-end tests, and stricter database network access.

