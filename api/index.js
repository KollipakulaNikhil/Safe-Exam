// Vercel serverless entry point
// Re-exports the Express http server so Vercel's @vercel/node runtime
// can handle requests. The server.js skips httpServer.listen() when
// process.env.VERCEL is set, so it works as a pure request handler.
import httpServer from '../server/server.js';
export default httpServer;
