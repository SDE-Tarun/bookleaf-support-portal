# Approach and trade-offs

I prioritised the core support workflow: secure sign-in, author-scoped book/ticket access, an admin queue, editable responses, and a policy-grounded AI assistant. MongoDB/Mongoose keeps the provided author-and-books dataset close to its original shape, while tickets are stored separately to make queue filters and activity indexes efficient. Express middleware centralises authentication, validation and error handling.

The AI provider is optional so local setup and the ticket lifecycle do not depend on an external API or incur costs unexpectedly. A compact knowledge-base summary and only the fields needed for the current ticket are sent to the model; deterministic rules and response templates provide a graceful fallback. AI output is treated as untrusted draft content, constrained to known enum values, and reviewed by an admin before it is sent.

For the first iteration, polling was chosen over WebSockets because it is simpler to deploy and sufficient for the assignment's near-real-time requirement. File attachment upload is not implemented because the brief explicitly marks it UI-only/bonus. Given more time, I would add a richer integration-test suite, audit logs, notification delivery, attachment scanning/storage, stronger account onboarding/password recovery, and observability around AI cost/latency/fallback rates.
