#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────
# AlzheimerVoice — AWS SES Email Setup
#
# Configures SES for transactional email:
#   - Domain verification (alzheimervoice.org)
#   - DKIM signing for deliverability
#   - MAIL FROM domain (mail.alzheimervoice.org)
#   - Cognito integration (SES as email provider)
#   - Custom email templates for all auth flows
#
# Usage:
#   bash scripts/setup-ses.sh
#
# Prerequisites:
#   - AWS CLI v2 configured
#   - Permissions: ses:*, cognito-idp:UpdateUserPool
#   - COGNITO_USER_POOL_ID env var (or pass as argument)
# ─────────────────────────────────────────────────────────

REGION="${AWS_REGION:-us-east-1}"
DOMAIN="alzheimervoice.org"
MAIL_FROM="mail.${DOMAIN}"
FROM_ADDRESS="noreply@${DOMAIN}"
POOL_ID="${COGNITO_USER_POOL_ID:-us-east-1_9N74zQoOA}"

echo "=== AlzheimerVoice SES Email Setup ==="
echo "Region:       $REGION"
echo "Domain:       $DOMAIN"
echo "From address: $FROM_ADDRESS"
echo "Pool ID:      $POOL_ID"
echo ""

# ─────────────────────────────────────────────────────────
# 1. Verify Domain Identity
# ─────────────────────────────────────────────────────────
echo "[1/6] Verifying domain identity..."

VERIFICATION_TOKEN=$(aws ses verify-domain-identity \
  --domain "$DOMAIN" \
  --region "$REGION" \
  --query 'VerificationToken' --output text 2>/dev/null || echo "")

if [ -n "$VERIFICATION_TOKEN" ]; then
  echo "  Verification token: $VERIFICATION_TOKEN"
  echo ""
  echo "  >>> ADD THIS DNS RECORD <<<"
  echo "  Type: TXT"
  echo "  Name: _amazonses.${DOMAIN}"
  echo "  Value: ${VERIFICATION_TOKEN}"
  echo ""
else
  echo "  Domain already submitted for verification"
fi

# ─────────────────────────────────────────────────────────
# 2. Enable DKIM Signing
# ─────────────────────────────────────────────────────────
echo "[2/6] Enabling DKIM..."

DKIM_TOKENS=$(aws ses verify-domain-dkim \
  --domain "$DOMAIN" \
  --region "$REGION" \
  --query 'DkimTokens' --output json 2>/dev/null || echo "[]")

echo "  >>> ADD THESE DKIM DNS RECORDS (CNAME) <<<"
echo ""
for TOKEN in $(echo "$DKIM_TOKENS" | python3 -c "import sys,json; [print(t) for t in json.load(sys.stdin)]" 2>/dev/null || echo ""); do
  echo "  Name:  ${TOKEN}._domainkey.${DOMAIN}"
  echo "  Value: ${TOKEN}.dkim.amazonses.com"
  echo ""
done

# ─────────────────────────────────────────────────────────
# 3. Set MAIL FROM Domain
# ─────────────────────────────────────────────────────────
echo "[3/6] Setting MAIL FROM domain..."

aws ses set-identity-mail-from-domain \
  --identity "$DOMAIN" \
  --mail-from-domain "$MAIL_FROM" \
  --behavior-on-mx-failure UseDefaultValue \
  --region "$REGION" 2>/dev/null || true

echo "  MAIL FROM: $MAIL_FROM"
echo ""
echo "  >>> ADD THESE DNS RECORDS <<<"
echo "  Type: MX"
echo "  Name: ${MAIL_FROM}"
echo "  Value: 10 feedback-smtp.${REGION}.amazonses.com"
echo ""
echo "  Type: TXT"
echo "  Name: ${MAIL_FROM}"
echo "  Value: \"v=spf1 include:amazonses.com ~all\""
echo ""

# ─────────────────────────────────────────────────────────
# 4. Create SES Email Templates
# ─────────────────────────────────────────────────────────
echo "[4/6] Creating SES email templates..."

create_template() {
  local TEMPLATE_NAME="$1"
  local TEMPLATE_FILE="$2"

  # Delete existing template (ignore error if not found)
  aws ses delete-template \
    --template-name "$TEMPLATE_NAME" \
    --region "$REGION" 2>/dev/null || true

  aws ses create-template \
    --template "$TEMPLATE_FILE" \
    --region "$REGION" 2>/dev/null

  echo "  Created template: $TEMPLATE_NAME"
}

# Welcome email
create_template "azh-welcome" "$(cat <<'TEMPLATE'
{
  "TemplateName": "azh-welcome",
  "SubjectPart": "Welcome to AlzheimerVoice, {{name}}",
  "HtmlPart": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;padding:40px 20px\"><tr><td align=\"center\"><table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden\"><tr><td style=\"background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center\"><h1 style=\"margin:0;color:#fff;font-size:24px;font-weight:700\">AlzheimerVoice</h1><p style=\"margin:8px 0 0;color:#e0e7ff;font-size:14px\">La voix se souvient de ce que l'esprit oublie</p></td></tr><tr><td style=\"padding:32px\"><h2 style=\"margin:0 0 16px;color:#f8fafc;font-size:20px\">Welcome, {{name}}</h2><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">Your AlzheimerVoice account is now active. You can start using the platform to monitor cognitive health through voice analysis.</p><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;border-radius:8px;border:1px solid #334155;margin:24px 0\"><tr><td style=\"padding:20px\"><p style=\"margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px\">Your Account</p><p style=\"margin:0 0 4px;color:#f8fafc;font-size:15px\"><strong>Email:</strong> {{email}}</p><p style=\"margin:0;color:#f8fafc;font-size:15px\"><strong>Plan:</strong> {{plan}}</p></td></tr></table><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:24px auto\"><tr><td style=\"background:#6366f1;border-radius:8px;padding:14px 32px\"><a href=\"https://interface.alzheimervoice.org\" style=\"color:#fff;text-decoration:none;font-size:15px;font-weight:600\">Open Dashboard</a></td></tr></table><p style=\"margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5\">If you have questions, contact your care team or visit our help center.</p></td></tr><tr><td style=\"padding:24px 32px;border-top:1px solid #334155;text-align:center\"><p style=\"margin:0;color:#475569;font-size:12px\">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>",
  "TextPart": "Welcome to AlzheimerVoice, {{name}}!\n\nYour account is now active.\nEmail: {{email}}\nPlan: {{plan}}\n\nOpen your dashboard: https://interface.alzheimervoice.org\n\n© 2026 AlzheimerVoice"
}
TEMPLATE
)"

# Account activated (role assigned by admin)
create_template "azh-account-activated" "$(cat <<'TEMPLATE'
{
  "TemplateName": "azh-account-activated",
  "SubjectPart": "Your AlzheimerVoice account has been activated",
  "HtmlPart": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;padding:40px 20px\"><tr><td align=\"center\"><table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden\"><tr><td style=\"background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center\"><h1 style=\"margin:0;color:#fff;font-size:24px;font-weight:700\">AlzheimerVoice</h1></td></tr><tr><td style=\"padding:32px\"><h2 style=\"margin:0 0 16px;color:#f8fafc;font-size:20px\">Account Activated</h2><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">Hi {{name}}, an administrator has activated your account with the following role:</p><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;border-radius:8px;border:1px solid #334155;margin:24px 0\"><tr><td style=\"padding:20px;text-align:center\"><p style=\"margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px\">Role</p><p style=\"margin:0;color:#818cf8;font-size:20px;font-weight:700\">{{role}}</p></td></tr></table><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">You can now access all features associated with your role. Log in to get started.</p><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:24px auto\"><tr><td style=\"background:#6366f1;border-radius:8px;padding:14px 32px\"><a href=\"https://interface.alzheimervoice.org\" style=\"color:#fff;text-decoration:none;font-size:15px;font-weight:600\">Log In Now</a></td></tr></table></td></tr><tr><td style=\"padding:24px 32px;border-top:1px solid #334155;text-align:center\"><p style=\"margin:0;color:#475569;font-size:12px\">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>",
  "TextPart": "Account Activated\n\nHi {{name}}, an administrator has activated your account.\nRole: {{role}}\n\nLog in: https://interface.alzheimervoice.org\n\n© 2026 AlzheimerVoice"
}
TEMPLATE
)"

# Security alert (password change, new login)
create_template "azh-security-alert" "$(cat <<'TEMPLATE'
{
  "TemplateName": "azh-security-alert",
  "SubjectPart": "Security Alert — AlzheimerVoice",
  "HtmlPart": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;padding:40px 20px\"><tr><td align=\"center\"><table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden\"><tr><td style=\"background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center\"><h1 style=\"margin:0;color:#fff;font-size:24px;font-weight:700\">Security Alert</h1></td></tr><tr><td style=\"padding:32px\"><h2 style=\"margin:0 0 16px;color:#f8fafc;font-size:20px\">{{alertTitle}}</h2><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">Hi {{name}}, we detected the following activity on your account:</p><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#450a0a;border-radius:8px;border:1px solid #7f1d1d;margin:24px 0\"><tr><td style=\"padding:20px\"><p style=\"margin:0 0 8px;color:#fca5a5;font-size:14px\"><strong>Event:</strong> {{eventType}}</p><p style=\"margin:0 0 8px;color:#fca5a5;font-size:14px\"><strong>Time:</strong> {{timestamp}}</p><p style=\"margin:0;color:#fca5a5;font-size:14px\"><strong>IP Address:</strong> {{ipAddress}}</p></td></tr></table><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">If this was you, no action is needed. If you did not perform this action, please reset your password immediately and contact support.</p><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:24px auto\"><tr><td style=\"background:#dc2626;border-radius:8px;padding:14px 32px\"><a href=\"https://interface.alzheimervoice.org/forgot-password\" style=\"color:#fff;text-decoration:none;font-size:15px;font-weight:600\">Reset Password</a></td></tr></table></td></tr><tr><td style=\"padding:24px 32px;border-top:1px solid #334155;text-align:center\"><p style=\"margin:0;color:#475569;font-size:12px\">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>",
  "TextPart": "Security Alert — {{alertTitle}}\n\nHi {{name}},\n\nEvent: {{eventType}}\nTime: {{timestamp}}\nIP: {{ipAddress}}\n\nIf this was not you, reset your password: https://interface.alzheimervoice.org/forgot-password\n\n© 2026 AlzheimerVoice"
}
TEMPLATE
)"

# Patient report ready
create_template "azh-report-ready" "$(cat <<'TEMPLATE'
{
  "TemplateName": "azh-report-ready",
  "SubjectPart": "New Analysis Report Available — AlzheimerVoice",
  "HtmlPart": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;padding:40px 20px\"><tr><td align=\"center\"><table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden\"><tr><td style=\"background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center\"><h1 style=\"margin:0;color:#fff;font-size:24px;font-weight:700\">AlzheimerVoice</h1></td></tr><tr><td style=\"padding:32px\"><h2 style=\"margin:0 0 16px;color:#f8fafc;font-size:20px\">New Report Available</h2><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">Hi {{name}}, a new cognitive voice analysis report is ready for {{patientName}}.</p><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;border-radius:8px;border:1px solid #334155;margin:24px 0\"><tr><td style=\"padding:20px\"><p style=\"margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px\">Report Summary</p><p style=\"margin:0 0 4px;color:#f8fafc;font-size:15px\"><strong>Patient:</strong> {{patientName}}</p><p style=\"margin:0 0 4px;color:#f8fafc;font-size:15px\"><strong>Date:</strong> {{reportDate}}</p><p style=\"margin:0;color:#f8fafc;font-size:15px\"><strong>Type:</strong> {{reportType}}</p></td></tr></table><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:24px auto\"><tr><td style=\"background:#6366f1;border-radius:8px;padding:14px 32px\"><a href=\"https://interface.alzheimervoice.org\" style=\"color:#fff;text-decoration:none;font-size:15px;font-weight:600\">View Report</a></td></tr></table></td></tr><tr><td style=\"padding:24px 32px;border-top:1px solid #334155;text-align:center\"><p style=\"margin:0;color:#475569;font-size:12px\">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>",
  "TextPart": "New Report Available\n\nHi {{name}}, a new analysis report is ready.\nPatient: {{patientName}}\nDate: {{reportDate}}\nType: {{reportType}}\n\nView: https://interface.alzheimervoice.org\n\n© 2026 AlzheimerVoice"
}
TEMPLATE
)"

# Account disabled
create_template "azh-account-disabled" "$(cat <<'TEMPLATE'
{
  "TemplateName": "azh-account-disabled",
  "SubjectPart": "Account Disabled — AlzheimerVoice",
  "HtmlPart": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;padding:40px 20px\"><tr><td align=\"center\"><table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden\"><tr><td style=\"background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center\"><h1 style=\"margin:0;color:#fff;font-size:24px;font-weight:700\">AlzheimerVoice</h1></td></tr><tr><td style=\"padding:32px\"><h2 style=\"margin:0 0 16px;color:#f8fafc;font-size:20px\">Account Disabled</h2><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">Hi {{name}}, your AlzheimerVoice account has been disabled by an administrator.</p><p style=\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\">If you believe this is an error, please contact your organization administrator or our support team.</p></td></tr><tr><td style=\"padding:24px 32px;border-top:1px solid #334155;text-align:center\"><p style=\"margin:0;color:#475569;font-size:12px\">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>",
  "TextPart": "Account Disabled\n\nHi {{name}}, your AlzheimerVoice account has been disabled by an administrator.\n\nIf you believe this is an error, contact your administrator.\n\n© 2026 AlzheimerVoice"
}
TEMPLATE
)"

echo ""

# ─────────────────────────────────────────────────────────
# 5. Configure Cognito to use SES
# ─────────────────────────────────────────────────────────
echo "[5/6] Configuring Cognito email..."

# Get the SES identity ARN
SES_IDENTITY_ARN="arn:aws:ses:${REGION}:$(aws sts get-caller-identity --query Account --output text):identity/${DOMAIN}"
echo "  SES Identity ARN: $SES_IDENTITY_ARN"

# Update user pool email configuration
aws cognito-idp update-user-pool \
  --user-pool-id "$POOL_ID" \
  --region "$REGION" \
  --email-configuration "{
    \"SourceArn\": \"${SES_IDENTITY_ARN}\",
    \"ReplyToEmailAddress\": \"support@${DOMAIN}\",
    \"EmailSendingAccount\": \"DEVELOPER\",
    \"From\": \"AlzheimerVoice <${FROM_ADDRESS}>\"
  }" \
  --email-verification-message "$(cat <<'MSG'
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden"><tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">AlzheimerVoice</h1><p style="margin:8px 0 0;color:#e0e7ff;font-size:14px">Verify Your Email</p></td></tr><tr><td style="padding:32px"><h2 style="margin:0 0 16px;color:#f8fafc;font-size:20px">Email Verification</h2><p style="margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6">Thank you for creating your AlzheimerVoice account. Enter the code below to verify your email address:</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:8px;border:1px solid #334155;margin:24px 0"><tr><td style="padding:24px;text-align:center"><p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px">Verification Code</p><p style="margin:0;color:#818cf8;font-size:36px;font-weight:700;letter-spacing:6px">{####}</p></td></tr></table><p style="margin:0;color:#64748b;font-size:13px;line-height:1.5">This code expires in 24 hours. If you did not create an account, ignore this email.</p></td></tr><tr><td style="padding:24px 32px;border-top:1px solid #334155;text-align:center"><p style="margin:0;color:#475569;font-size:12px">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>
MSG
)" \
  --email-verification-subject "Your AlzheimerVoice Verification Code" \
  --admin-create-user-config "{
    \"AllowAdminCreateUserOnly\": false,
    \"InviteMessageTemplate\": {
      \"EmailMessage\": \"<!DOCTYPE html><html><head><meta charset=\\\"utf-8\\\"><meta name=\\\"viewport\\\" content=\\\"width=device-width,initial-scale=1\\\"></head><body style=\\\"margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\\\"><table width=\\\"100%\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" style=\\\"background:#0f172a;padding:40px 20px\\\"><tr><td align=\\\"center\\\"><table width=\\\"560\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" style=\\\"background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden\\\"><tr><td style=\\\"background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center\\\"><h1 style=\\\"margin:0;color:#fff;font-size:24px;font-weight:700\\\">AlzheimerVoice</h1><p style=\\\"margin:8px 0 0;color:#e0e7ff;font-size:14px\\\">You're Invited</p></td></tr><tr><td style=\\\"padding:32px\\\"><h2 style=\\\"margin:0 0 16px;color:#f8fafc;font-size:20px\\\">Welcome to AlzheimerVoice</h2><p style=\\\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\\\">An administrator has created an account for you. Use the credentials below to log in:</p><table width=\\\"100%\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" style=\\\"background:#0f172a;border-radius:8px;border:1px solid #334155;margin:24px 0\\\"><tr><td style=\\\"padding:20px\\\"><p style=\\\"margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px\\\">Login Credentials</p><p style=\\\"margin:0 0 8px;color:#f8fafc;font-size:15px\\\"><strong>Username:</strong> {username}</p><p style=\\\"margin:0;color:#f8fafc;font-size:15px\\\"><strong>Temporary Password:</strong> {####}</p></td></tr></table><p style=\\\"margin:0 0 16px;color:#94a3b8;font-size:15px;line-height:1.6\\\">You will be asked to set a new password on your first login.</p><table cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" style=\\\"margin:24px auto\\\"><tr><td style=\\\"background:#6366f1;border-radius:8px;padding:14px 32px\\\"><a href=\\\"https://interface.alzheimervoice.org/login\\\" style=\\\"color:#fff;text-decoration:none;font-size:15px;font-weight:600\\\">Log In Now</a></td></tr></table><p style=\\\"margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5\\\">This temporary password expires in 1 day. Contact your administrator if you need assistance.</p></td></tr><tr><td style=\\\"padding:24px 32px;border-top:1px solid #334155;text-align:center\\\"><p style=\\\"margin:0;color:#475569;font-size:12px\\\">&copy; 2026 AlzheimerVoice. HIPAA-compliant platform.</p></td></tr></table></td></tr></table></body></html>\",
      \"EmailSubject\": \"You're Invited to AlzheimerVoice\"
    }
  }" 2>/dev/null

echo "  Cognito configured to send via SES"
echo "  Verification email: custom HTML template"
echo "  Invitation email: custom HTML template"

# ─────────────────────────────────────────────────────────
# 6. Verification Status & DNS Summary
# ─────────────────────────────────────────────────────────
echo ""
echo "[6/6] Checking status..."

DOMAIN_STATUS=$(aws ses get-identity-verification-attributes \
  --identities "$DOMAIN" \
  --region "$REGION" \
  --query "VerificationAttributes.\"${DOMAIN}\".VerificationStatus" --output text 2>/dev/null || echo "Unknown")

DKIM_STATUS=$(aws ses get-identity-dkim-attributes \
  --identities "$DOMAIN" \
  --region "$REGION" \
  --query "DkimAttributes.\"${DOMAIN}\".DkimVerificationStatus" --output text 2>/dev/null || echo "Unknown")

echo "  Domain verification: $DOMAIN_STATUS"
echo "  DKIM status: $DKIM_STATUS"
echo ""

SEND_QUOTA=$(aws ses get-send-quota --region "$REGION" --query '[Max24HourSend,SentLast24Hours]' --output text 2>/dev/null || echo "? ?")
echo "  Send quota: $SEND_QUOTA"

echo ""
echo "============================================"
echo "  SES Email Setup Complete"
echo "============================================"
echo ""
echo "Add to .env:"
echo "  SES_REGION=$REGION"
echo "  SES_FROM_ADDRESS=$FROM_ADDRESS"
echo ""
echo ">>> REQUIRED DNS RECORDS FOR alzheimervoice.org <<<"
echo ""
echo "1. Domain Verification (TXT):"
echo "   Name:  _amazonses.${DOMAIN}"
echo "   Value: ${VERIFICATION_TOKEN}"
echo ""
echo "2. DKIM (3 CNAME records):"
for TOKEN in $(echo "$DKIM_TOKENS" | python3 -c "import sys,json; [print(t) for t in json.load(sys.stdin)]" 2>/dev/null || echo ""); do
  echo "   ${TOKEN}._domainkey.${DOMAIN} -> ${TOKEN}.dkim.amazonses.com"
done
echo ""
echo "3. MAIL FROM - MX:"
echo "   Name:  ${MAIL_FROM}"
echo "   Value: 10 feedback-smtp.${REGION}.amazonses.com"
echo ""
echo "4. MAIL FROM - SPF (TXT):"
echo "   Name:  ${MAIL_FROM}"
echo "   Value: v=spf1 include:amazonses.com ~all"
echo ""
echo "NOTE: SES is in sandbox mode (200 emails/day)."
echo "To send to unverified addresses, request production access:"
echo "  aws ses put-account-sending-attributes --region $REGION"
echo "  (or via AWS Console > SES > Account dashboard > Request production access)"
echo "============================================"
