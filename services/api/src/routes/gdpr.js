/**
 * GDPR Routes — API Gateway
 *
 * Art. 17 — Right to Erasure
 * Art. 20 — Right to Data Portability
 */

import { loadPatient, deletePatient } from '@azh/shared-models/patient';
import { loadPatientSessions, deletePatientSessions } from '@azh/shared-models/session';
import { loadMemoryProfile } from '@azh/shared-models/memory';
import { exportPatientCvfData, deletePatientCvfData } from '@azh/shared-models/cvf';
import { requireRole, requirePatientAccess } from '@azh/shared-auth/rbac';
import fs from 'fs/promises';
import path from 'path';

export default async function gdprRoutes(app) {

  // GDPR Export — Data Portability (Art. 20)
  app.get('/api/gdpr/export/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request, reply) => {
    const { patientId } = request.params;
    try {
      const patient = await loadPatient(patientId);
      const sessions = await loadPatientSessions(patientId);
      const memories = await loadMemoryProfile(patientId);
      const cvfData = await exportPatientCvfData(patientId);
      return {
        exportDate: new Date().toISOString(),
        gdprArticle: 'Art. 20 — Right to Data Portability',
        patient, sessions, memories,
        cvfBaseline: cvfData.baseline,
        v3Baseline: cvfData.v3Baseline,
        weeklyReports: cvfData.weeklyReports,
      };
    } catch {
      return reply.code(404).send({ error: 'Patient not found' });
    }
  });

  // GDPR Erasure — Right to be Forgotten (Art. 17)
  app.delete('/api/gdpr/erase/:patientId', {
    preHandler: [requireRole('clinician'), requirePatientAccess()],
  }, async (request, reply) => {
    const { patientId } = request.params;
    const { confirmPatientId } = request.body || {};
    if (confirmPatientId !== patientId) {
      return reply.code(400).send({ error: 'Confirmation mismatch. Send { confirmPatientId } matching the patient ID.' });
    }
    const deletedSessions = await deletePatientSessions(patientId);
    const deletedCvf = await deletePatientCvfData(patientId);
    await deletePatient(patientId);
    return {
      erased: true,
      gdprArticle: 'Art. 17 — Right to Erasure',
      patientId,
      timestamp: new Date().toISOString(),
      details: { patient: 1, sessions: deletedSessions, cvfFiles: deletedCvf, memories: 1 },
    };
  });

  // GDPR Full Platform Erasure (superadmin only)
  app.delete('/api/gdpr/erase-all', {
    preHandler: [requireRole('superadmin')],
  }, async (request, reply) => {
    const { confirm } = request.body || {};
    if (confirm !== 'DELETE_ALL_DATA') {
      return reply.code(400).send({ error: 'Send { confirm: "DELETE_ALL_DATA" } to proceed.' });
    }
    const dataRoot = process.env.DATA_ROOT || './data';
    const dirs = ['patients', 'sessions', 'cvf', 'reports', 'v3-baselines'];
    let totalDeleted = 0;
    for (const dir of dirs) {
      const dirPath = path.resolve(dataRoot, dir);
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            await fs.unlink(path.join(dirPath, file));
            totalDeleted++;
          }
        }
      } catch {}
    }
    return {
      erased: true,
      gdprArticle: 'Art. 17 — Full Platform Erasure',
      timestamp: new Date().toISOString(),
      filesDeleted: totalDeleted,
    };
  });
}
