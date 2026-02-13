/**
 * Notification repository — PostgreSQL implementation.
 */

import { orgQuery } from '../connection.js';

/**
 * Create a notification.
 */
export async function createNotification(orgId, { userId, type, title, message, metadata = {} }) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [userId, orgId, type, title, message, JSON.stringify(metadata)]);

  return rows[0];
}

/**
 * Get unread notifications for a user.
 */
export async function getUnreadNotifications(orgId, userId, limit = 20) {
  const { rows } = await orgQuery(orgId, `
    SELECT * FROM notifications
    WHERE user_id = $1 AND read = FALSE
    ORDER BY created_at DESC
    LIMIT $2
  `, [userId, limit]);

  return rows;
}

/**
 * Get all notifications for a user (paginated).
 */
export async function getNotifications(orgId, userId, { limit = 50, offset = 0 } = {}) {
  const { rows } = await orgQuery(orgId, `
    SELECT * FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);

  return rows;
}

/**
 * Mark a notification as read.
 */
export async function markRead(orgId, notificationId) {
  await orgQuery(orgId,
    'UPDATE notifications SET read = TRUE WHERE id = $1',
    [notificationId]
  );
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllRead(orgId, userId) {
  await orgQuery(orgId,
    'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
    [userId]
  );
}

/**
 * Get unread count for a user.
 */
export async function getUnreadCount(orgId, userId) {
  const { rows } = await orgQuery(orgId,
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = FALSE',
    [userId]
  );
  return rows[0].count;
}
