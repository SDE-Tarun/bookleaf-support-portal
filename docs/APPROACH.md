# Implementation Approach — BookLeaf Support Portal

## Priorities

I prioritised the complete support workflow first: an author can sign in, view their books, create a support request, and follow its progress; an administrator can review incoming tickets, assign ownership, update priority and status, add private notes, and reply to the author. I also prioritised access control so authors cannot access other authors’ tickets or admin-only operations.

## Architecture and Trade-offs

I used React with Vite for the frontend, Node.js and Express for the REST API, and MongoDB with Mongoose for persistence. I kept route handling, controllers, middleware, models, and AI-related services separate to improve readability and maintainability. JWT authentication and role-based middleware protect the API.

For near-real-time updates, I chose polling rather than WebSockets. Polling is simpler to implement and adequate for the expected demo traffic, though Server-Sent Events or WebSockets could be more efficient at larger scale.

## AI Strategy and Reliability

Classification and response drafting are treated as decision-support features. Classification uses the ticket content to suggest a category and priority, while response drafts use BookLeaf’s supplied policy information and support-tone guidance. Administrators retain control over ticket changes and sending responses.

The application supports rule-based classification and template-based drafting when a live AI provider is unavailable or unconfigured. The deployed demo currently uses this fallback path without a configured provider key. This keeps core ticket handling available, although fallback output is less flexible than a live language model. A production deployment would use a secured backend-only provider key, bounded prompts, limited relevant context, timeouts, rate-limit handling, and monitoring of cost and output quality.

## Validation and Security

I tested the backend classifier, built the frontend for production, and manually verified key author and admin flows. These checks included ticket creation, queue visibility, replies, ticket assignment, status and priority changes, invalid ticket IDs, and role-based restrictions.

Before production use, I would add broader automated integration and end-to-end tests, password reset and credential-management flows, structured audit logs, monitoring, and stricter database network access. I would also verify that internal notes are excluded from every author-facing response and that generating a draft never sends it automatically.

## Next Steps

With more time, I would add actual file uploads with type and size restrictions, stronger operational observability, a more comprehensive AI evaluation dataset, and real-time updates through Server-Sent Events or WebSockets. I would also add deployment safeguards for database migrations and demo-data seeding so that development utilities cannot accidentally delete production records.