/**
 * API Gateway Service — api.alzheimervoice.com
 *
 * Internal-only API gateway for the AlzheimerVoice platform.
 * No external API access — used exclusively by:
 *   - interface.alzheimervoice.com (family/clinician SaaS)
 *   - rk2.alzheimervoice.com (admin panel)
 *
 * Handles auth, patient CRUD, memories, GDPR, admin.
 * Proxies CVF computation requests to cvf.alzheimervoice.com.
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import authPlugin from './plugins/auth.js';
import auditPlugin from './plugins/audit.js';
import patientRoutes from './routes/patients.js';
import memoryRoutes from './routes/memories.js';
import gdprRoutes from './routes/gdpr.js';
import adminRoutes from './routes/admin.js';
import cvfProxyRoutes from './routes/cvf-proxy.js';

const app = Fastify({ logger: true });

// --- Security middleware ---
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
await app.register(cors, {
  origin: [
    process.env.INTERFACE_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
  ],
  credentials: true,
});
await app.register(authPlugin);
await app.register(auditPlugin);

// --- Route Groups ---
await app.register(patientRoutes);
await app.register(memoryRoutes);
await app.register(gdprRoutes);
await app.register(adminRoutes);
await app.register(cvfProxyRoutes);

// --- Health Check (public) ---
app.get('/health', async () => ({
  status: 'ok',
  service: 'api-gateway',
  domain: 'api.alzheimervoice.com',
  version: '1.0.0',
  endpoints: {
    auth: '/api/auth/login',
    patients: '/api/patients',
    cvf_v1: '/api/cvf/*',
    cvf_v2: '/api/v2/*',
    cvf_v3: '/api/v3/*',
    gdpr: '/api/gdpr/*',
    admin: '/api/admin/*',
  },
}));

// --- Start ---
const port = process.env.API_PORT || process.env.PORT || 3001;
try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`\n  API Gateway running on http://localhost:${port}`);
  console.log(`  Domain: api.alzheimervoice.com`);
  console.log(`  CVF proxy → ${process.env.CVF_URL || 'http://localhost:3002'}`);
  console.log(`  CORS: ${process.env.INTERFACE_URL || 'localhost:5173'}, ${process.env.ADMIN_URL || 'localhost:5174'}`);
  console.log(`  "La voix se souvient de ce que l'esprit oublie."\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
