import app from './app.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
try { await connectDb(); const server = app.listen(env.port, () => console.info(`BookLeaf API listening on port ${env.port}`)); const shutdown = async () => { server.close(() => process.exit(0)); }; process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown); } catch (err) { console.error('Startup failed:', err.message); process.exit(1); }
