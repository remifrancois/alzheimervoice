/**
 * Memory Routes — API Gateway
 */

import { loadMemoryProfile, saveMemoryProfile, createMemory } from '@azh/shared-models/memory';
import { requireRole, requirePatientAccess } from '@azh/shared-auth/rbac';

export default async function memoryRoutes(app) {

  app.get('/api/memories/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    return await loadMemoryProfile(request.params.patientId);
  });

  app.post('/api/memories/:patientId', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
  }, async (request) => {
    const profile = await loadMemoryProfile(request.params.patientId);
    const memory = createMemory(request.body);
    profile.memories.push(memory);
    await saveMemoryProfile(profile);
    return memory;
  });
}
