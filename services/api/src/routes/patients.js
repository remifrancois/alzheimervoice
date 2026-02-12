/**
 * Patient Routes — API Gateway
 */

import { createPatient, savePatient, loadPatient, listPatients } from '@azh/shared-models/patient';
import { requireRole, requirePatientAccess, filterPatientsForUser } from '@azh/shared-auth/rbac';

export default async function patientRoutes(app) {

  app.get('/api/patients', {
    preHandler: [requireRole('clinician', 'family')],
  }, async (request) => {
    const all = await listPatients();
    return filterPatientsForUser(request, all);
  });

  app.post('/api/patients', {
    preHandler: [requireRole('clinician')],
  }, async (request) => {
    const patient = createPatient(request.body);
    await savePatient(patient);
    return patient;
  });

  app.get('/api/patients/:id', {
    preHandler: [requireRole('clinician', 'family'), requirePatientAccess('id')],
  }, async (request, reply) => {
    try {
      return await loadPatient(request.params.id);
    } catch {
      return reply.code(404).send({ error: 'Patient not found' });
    }
  });
}
