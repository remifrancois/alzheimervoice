/**
 * Cognito Admin Routes — User management via AWS SDK.
 *
 * All routes require admin role.
 * Only active when COGNITO_USER_POOL_ID is set.
 */

import { requireRole } from '@azh/shared-auth/rbac';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { loadUsers, saveUsers } from '@azh/shared-models/users';

export default async function cognitoAdminRoutes(app) {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!userPoolId) {
    app.log.info('Cognito admin routes: skipped (no COGNITO_USER_POOL_ID)');
    return;
  }

  const region = process.env.COGNITO_REGION || 'us-east-1';
  const client = new CognitoIdentityProviderClient({ region });

  // ── List users ──
  app.get('/api/admin/cognito/users', {
    preHandler: [requireRole('admin')],
  }, async (request) => {
    const limit = parseInt(request.query.limit || '50');
    const paginationToken = request.query.token || undefined;

    const cmd = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: limit,
      PaginationToken: paginationToken,
    });
    const result = await client.send(cmd);

    const users = (result.Users || []).map(u => {
      const attrs = {};
      for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
      return {
        username: u.Username,
        email: attrs.email || '',
        name: attrs.name || '',
        azhUserId: attrs['custom:azh_user_id'] || '',
        status: u.UserStatus,
        enabled: u.Enabled,
        created: u.UserCreateDate,
        modified: u.UserLastModifiedDate,
      };
    });

    return {
      users,
      nextToken: result.PaginationToken || null,
    };
  });

  // ── Create user ──
  app.post('/api/admin/cognito/users', {
    preHandler: [requireRole('admin')],
  }, async (request, reply) => {
    const { email, name, role, plan, temporaryPassword } = request.body || {};

    if (!email || !name || !role) {
      return reply.code(400).send({ error: 'email, name, and role are required' });
    }

    if (!['admin', 'clinician', 'family'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role. Must be admin, clinician, or family' });
    }

    // Default plan by role
    const PLAN_DEFAULTS = { admin: 'admin', clinician: 'clinical', family: 'free' };
    const userPlan = plan || PLAN_DEFAULTS[role] || 'free';

    // Generate an azh user ID
    const azhUserId = `u${Date.now().toString(36)}`;

    const createCmd = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      TemporaryPassword: temporaryPassword || undefined,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: name },
        { Name: 'custom:azh_user_id', Value: azhUserId },
      ],
      DesiredDeliveryMediums: ['EMAIL'],
    });
    await client.send(createCmd);

    // Add to role group
    const groupCmd = new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: role,
    });
    await client.send(groupCmd);

    // Add to local users.json
    const users = await loadUsers();
    users.push({
      id: azhUserId,
      name,
      email,
      role,
      plan: userPlan,
      avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    });
    await saveUsers(users);

    return {
      message: 'User created',
      user: { azhUserId, email, name, role, plan: userPlan },
    };
  });

  // ── Change user role ──
  app.put('/api/admin/cognito/users/:email/role', {
    preHandler: [requireRole('admin')],
  }, async (request, reply) => {
    const { email } = request.params;
    const { role } = request.body || {};

    if (!['admin', 'clinician', 'family'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role. Must be admin, clinician, or family' });
    }

    // Remove from all groups first
    for (const group of ['admin', 'clinician', 'family']) {
      try {
        await client.send(new AdminRemoveUserFromGroupCommand({
          UserPoolId: userPoolId,
          Username: email,
          GroupName: group,
        }));
      } catch {
        // Ignore errors (user may not be in this group)
      }
    }

    // Add to new group
    await client.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: role,
    }));

    // Update local users.json
    const users = await loadUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      user.role = role;
      await saveUsers(users);
    }

    return { message: 'Role updated', email, role };
  });

  // ── Disable user ──
  app.delete('/api/admin/cognito/users/:email', {
    preHandler: [requireRole('admin')],
  }, async (request) => {
    const { email } = request.params;

    await client.send(new AdminDisableUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    }));

    return { message: 'User disabled', email };
  });

  // ── Enable user ──
  app.post('/api/admin/cognito/users/:email/enable', {
    preHandler: [requireRole('admin')],
  }, async (request) => {
    const { email } = request.params;

    await client.send(new AdminEnableUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    }));

    return { message: 'User enabled', email };
  });

  // ── Update patient mapping ──
  app.post('/api/admin/cognito/users/:email/patients', {
    preHandler: [requireRole('admin')],
  }, async (request, reply) => {
    const { email } = request.params;
    const { patientIds } = request.body || {};

    if (!Array.isArray(patientIds)) {
      return reply.code(400).send({ error: 'patientIds must be an array' });
    }

    const users = await loadUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      return reply.code(404).send({ error: 'User not found in local store' });
    }

    user.patientId = patientIds.length === 1 ? patientIds[0] : undefined;
    user.patientIds = patientIds.length > 1 ? patientIds : undefined;
    await saveUsers(users);

    return { message: 'Patient mapping updated', email, patientIds };
  });

  // ── Get user details ──
  app.get('/api/admin/cognito/users/:email', {
    preHandler: [requireRole('admin')],
  }, async (request) => {
    const { email } = request.params;

    const result = await client.send(new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    }));

    const attrs = {};
    for (const a of result.UserAttributes || []) attrs[a.Name] = a.Value;

    // Get local user data
    const users = await loadUsers();
    const localUser = users.find(u => u.email === email);

    return {
      username: result.Username,
      email: attrs.email || '',
      name: attrs.name || '',
      azhUserId: attrs['custom:azh_user_id'] || '',
      status: result.UserStatus,
      enabled: result.Enabled,
      created: result.UserCreateDate,
      modified: result.UserLastModifiedDate,
      localData: localUser || null,
    };
  });
}
