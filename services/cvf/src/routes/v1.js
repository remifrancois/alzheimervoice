/**
 * V1 CVF Routes — Internal CVF Service
 *
 * Prefix: /cvf/v1
 */

import { processConversation, getPatientTimeline } from '../engine/v1/cvf-engine.js';
import { runWeeklyAnalysis } from '../engine/v1/drift-detector.js';
import { loadWeeklyAnalysis } from '@azh/shared-models/cvf';

export default async function v1Routes(app) {

  // POST /cvf/v1/process — Process a conversation session
  app.post('/process', async (request, reply) => {
    const { patientId, transcript, language, confounders, durationSeconds } = request.body;
    return await processConversation({ patientId, transcript, language, confounders, durationSeconds });
  });

  // GET /cvf/v1/timeline/:patientId — Full CVF timeline
  app.get('/timeline/:patientId', async (request) => {
    return await getPatientTimeline(request.params.patientId);
  });

  // POST /cvf/v1/weekly-analysis — Run weekly drift detection
  app.post('/weekly-analysis', async (request) => {
    const { patientId, weekNumber } = request.body;
    return await runWeeklyAnalysis(patientId, weekNumber);
  });

  // GET /cvf/v1/weekly-report/:patientId/:weekNumber — Weekly report
  app.get('/weekly-report/:patientId/:weekNumber', async (request, reply) => {
    const data = await loadWeeklyAnalysis(request.params.patientId, parseInt(request.params.weekNumber));
    if (!data) return reply.code(404).send({ error: 'Report not found' });
    return data;
  });
}
