/**
 * CVF Engine Service — cvf.alzheimervoice.org
 *
 * Internal microservice for Cognitive Voice Fingerprint computation.
 * Called exclusively by the API gateway (api.alzheimervoice.org).
 *
 * Handles V1/V2/V3 analysis pipelines, feature extraction, and Claude API calls.
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import internalAuthPlugin from './plugins/internal-auth.js';
import v1Routes from './routes/v1.js';
import v2Routes from './routes/v2.js';
import v3Routes from './routes/v3.js';
import v4Api from './engine/v4/api.js';

const app = Fastify({ logger: true });

// --- Security middleware ---
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
await app.register(cors, {
  origin: [
    process.env.API_URL || 'http://localhost:3001',
  ],
  credentials: true,
});
await app.register(internalAuthPlugin);

// --- CVF Route Groups ---
await app.register(v1Routes, { prefix: '/cvf/v1' });
await app.register(v2Routes, { prefix: '/cvf/v2' });
await app.register(v3Routes, { prefix: '/cvf/v3' });
await app.register(v4Api, { prefix: '/cvf/v4' });

// --- Health Check ---
app.get('/health', async () => ({
  status: 'ok',
  service: 'cvf-engine',
  domain: 'cvf.alzheimervoice.org',
  version: '4.0.0',
  features: {
    v1: ['cvf_extraction', 'baseline_calibration', 'drift_detection', 'weekly_analysis'],
    v2: ['living_library', 'differential_diagnosis', 'cognitive_archaeology', 'cognitive_twin', 'synthetic_cohort', 'temporal_hologram'],
    v3: ['47_indicators', '6_condition_differential', 'cascade_detection', 'trajectory_prediction', 'daily_sonnet_drift', 'weekly_opus_deep'],
    v4: ['85_indicators', '9_domains', 'acoustic_pipeline', 'pd_motor_domain', 'nonlinear_dynamics', 'micro_tasks', '8_condition_differential', '23_rules', 'decline_profiling', 'parkinsonian_differential']
  },
}));

// --- Start ---
const port = process.env.CVF_PORT || 3002;
try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`\n  CVF Engine running on http://localhost:${port}`);
  console.log(`  Internal service — accepts only x-service-key authenticated requests`);
  console.log(`  V1: /cvf/v1/* | V2: /cvf/v2/* | V3: /cvf/v3/* | V4: /cvf/v4/*\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
