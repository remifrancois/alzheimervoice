/**
 * CVF Engine Service — cvf.alzheimervoice.org
 *
 * Internal microservice for Cognitive Voice Fingerprint computation.
 * Called exclusively by the API gateway (api.alzheimervoice.org).
 *
 * V5 "deep_voice" engine — 107 indicators, 11 domains, 35 rules, 11 conditions.
 * Previous engine versions (V1-V4) archived in /previous-engine-releases.
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import internalAuthPlugin from './plugins/internal-auth.js';
import v5Api from './engine/v5/api.js';

const app = Fastify({ logger: true, bodyLimit: 16 * 1024 * 1024 });

// --- Security middleware ---
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
await app.register(cors, {
  origin: [
    process.env.API_URL || 'http://localhost:3001',
    process.env.SITE_URL || 'http://localhost:5175',
    'https://alzheimervoice.org',
    'https://www.alzheimervoice.org',
    'https://alzheimervoice.vercel.app',
  ],
  credentials: true,
});
await app.register(internalAuthPlugin);

// --- CVF V5 Routes ---
await app.register(v5Api, { prefix: '/cvf/v5' });

// --- Health Check ---
app.get('/health', async () => ({
  status: 'ok',
  service: 'cvf-engine',
  domain: 'cvf.alzheimervoice.org',
  version: '5.2.0',
  engine: 'deep_voice',
  features: ['107_indicators', '11_domains', 'opus_daily', 'dual_pass_extraction', 'topic_detection', 'nlp_anchors', 'gpu_acoustic', 'whisper_temporal', 'lbd_ftd_detection', '11_condition_differential', '35_rules', 'cross_validation', 'decline_profiling', 'pragmatic_domain', 'executive_domain', 'age_normalization', 'vci_detection'],
}));

// --- Start ---
const port = process.env.CVF_PORT || 3002;
try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`\n  CVF Engine V5.2 "deep_voice" running on http://localhost:${port}`);
  console.log(`  107 indicators | 11 domains | 35 rules | 11 conditions`);
  console.log(`  V5: /cvf/v5/*\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
