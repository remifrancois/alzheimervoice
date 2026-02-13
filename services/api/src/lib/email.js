/**
 * Email Service — Sends transactional emails via AWS SES.
 *
 * Used for application-triggered emails (welcome, alerts, reports).
 * Cognito handles auth-flow emails (verification, password reset, invitation)
 * directly via its SES integration.
 *
 * HIPAA §164.312(e) — Transmission Security
 */

import {
  SESClient,
  SendTemplatedEmailCommand,
  SendEmailCommand,
} from '@aws-sdk/client-ses';

let _client = null;
let _config = { fromAddress: '', region: 'us-east-1' };

/**
 * Initialize the email service.
 * Call once at startup. No-op if SES_FROM_ADDRESS is not set.
 */
export function initEmailService(config = {}) {
  _config = {
    region: config.region || process.env.SES_REGION || process.env.COGNITO_REGION || 'us-east-1',
    fromAddress: config.fromAddress || process.env.SES_FROM_ADDRESS || '',
  };

  if (!_config.fromAddress) {
    return false;
  }

  _client = new SESClient({ region: _config.region });
  return true;
}

/**
 * Check if email service is available.
 */
export function isEmailEnabled() {
  return !!_client && !!_config.fromAddress;
}

/**
 * Send a templated email via SES.
 *
 * @param {string} to - Recipient email
 * @param {string} templateName - SES template name (e.g. 'azh-welcome')
 * @param {Object} templateData - Template variables
 */
export async function sendTemplatedEmail(to, templateName, templateData) {
  if (!_client) {
    throw new Error('Email service not initialized');
  }

  const cmd = new SendTemplatedEmailCommand({
    Source: `AlzheimerVoice <${_config.fromAddress}>`,
    Destination: { ToAddresses: [to] },
    Template: templateName,
    TemplateData: JSON.stringify(templateData),
  });

  return _client.send(cmd);
}

/**
 * Send a raw HTML email (for one-off messages).
 *
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML content
 * @param {string} [textBody] - Plain text fallback
 */
export async function sendEmail(to, subject, htmlBody, textBody) {
  if (!_client) {
    throw new Error('Email service not initialized');
  }

  const cmd = new SendEmailCommand({
    Source: `AlzheimerVoice <${_config.fromAddress}>`,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        ...(textBody ? { Text: { Data: textBody, Charset: 'UTF-8' } } : {}),
      },
    },
  });

  return _client.send(cmd);
}

// ── Convenience methods for each email type ──

/**
 * Send welcome email after first login / account creation.
 */
export async function sendWelcomeEmail(to, { name, email, plan }) {
  return sendTemplatedEmail(to, 'azh-welcome', { name, email, plan });
}

/**
 * Send account activated email (admin assigned a role).
 */
export async function sendAccountActivatedEmail(to, { name, role }) {
  return sendTemplatedEmail(to, 'azh-account-activated', { name, role });
}

/**
 * Send security alert email (password change, suspicious login, etc.).
 */
export async function sendSecurityAlertEmail(to, { name, alertTitle, eventType, timestamp, ipAddress }) {
  return sendTemplatedEmail(to, 'azh-security-alert', {
    name,
    alertTitle,
    eventType,
    timestamp,
    ipAddress,
  });
}

/**
 * Send patient report ready notification.
 */
export async function sendReportReadyEmail(to, { name, patientName, reportDate, reportType }) {
  return sendTemplatedEmail(to, 'azh-report-ready', {
    name,
    patientName,
    reportDate,
    reportType,
  });
}

/**
 * Send account disabled notification.
 */
export async function sendAccountDisabledEmail(to, { name }) {
  return sendTemplatedEmail(to, 'azh-account-disabled', { name });
}
