/**
 * Role-Based Access Control (RBAC) helpers.
 *
 * HIPAA §164.312(a) — Access Controls
 * HIPAA §164.502(b) — Minimum Necessary
 *
 * Usage in routes:
 *   preHandler: [requireRole('clinician', 'family')]
 *   preHandler: [requireRole('clinician'), requirePatientAccess('patientId')]
 */

/**
 * Fastify preHandler — rejects request if user role is not in the allowed list.
 */
export function requireRole(...roles) {
  return async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden — insufficient role' });
    }
  };
}

/**
 * Fastify preHandler — rejects if user cannot access the given patient.
 * @param {string} paramName — name of the route param containing patientId (default: 'patientId')
 */
export function requirePatientAccess(paramName = 'patientId') {
  return async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
    const { role, patientIds } = request.user;
    // Admin/superadmin cannot access patient data
    if (role === 'superadmin' || role === 'admin') {
      return reply.code(403).send({ error: 'Admin roles cannot access patient data' });
    }
    const patientId = request.params[paramName] || request.body?.patientId;
    if (patientId && patientIds && !patientIds.includes(patientId)) {
      return reply.code(403).send({ error: 'Access denied for this patient' });
    }
  };
}

/**
 * Filter a list of patients to only those the user is authorized to see.
 */
export function filterPatientsForUser(request, patients) {
  if (!request.user) return [];
  const { patientIds } = request.user;
  if (!patientIds || patientIds.length === 0) return [];
  return patients.filter(p => patientIds.includes(p.patient_id));
}
