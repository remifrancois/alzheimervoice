#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────
# AlzheimerVoice — Cognito User Pool Setup
#
# Creates the full auth infrastructure:
#   - User Pool with email login + password policy
#   - 2 App Clients (interface + admin, no secret, SRP)
#   - 3 Groups (admin, clinician, family)
#   - 6 seeded demo users
#
# Usage:
#   AWS_REGION=us-east-1 bash scripts/setup-cognito.sh
#
# Prerequisites:
#   - AWS CLI v2 configured with credentials
#   - Permissions: cognito-idp:*
# ─────────────────────────────────────────────────────────

REGION="${AWS_REGION:-us-east-1}"
POOL_NAME="alzheimervoice-users"
INTERFACE_CLIENT_NAME="azh-interface"
ADMIN_CLIENT_NAME="azh-admin"

echo "=== AlzheimerVoice Cognito Setup ==="
echo "Region: $REGION"
echo ""

# ─────────────────────────────────────────────────────────
# 1. Create User Pool
# ─────────────────────────────────────────────────────────
echo "[1/6] Creating User Pool..."

EXISTING_POOL=$(aws cognito-idp list-user-pools --max-results 60 --region "$REGION" \
  --query "UserPools[?Name=='${POOL_NAME}'].Id | [0]" --output text 2>/dev/null || echo "None")

if [ "$EXISTING_POOL" != "None" ] && [ -n "$EXISTING_POOL" ]; then
  POOL_ID="$EXISTING_POOL"
  echo "  Pool already exists: $POOL_ID"
else
  POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "$POOL_NAME" \
    --region "$REGION" \
    --auto-verified-attributes email \
    --username-attributes email \
    --username-configuration "CaseSensitive=false" \
    --policies '{
      "PasswordPolicy": {
        "MinimumLength": 8,
        "RequireUppercase": true,
        "RequireLowercase": true,
        "RequireNumbers": true,
        "RequireSymbols": false,
        "TemporaryPasswordValidityDays": 7
      }
    }' \
    --schema '[
      {"Name":"email","Required":true,"Mutable":true},
      {"Name":"name","Required":true,"Mutable":true},
      {"Name":"custom:azh_user_id","AttributeDataType":"String","Mutable":true,"StringAttributeConstraints":{"MinLength":"1","MaxLength":"64"}}
    ]' \
    --account-recovery-setting '{
      "RecoveryMechanisms": [{"Priority":1,"Name":"verified_email"}]
    }' \
    --admin-create-user-config '{
      "AllowAdminCreateUserOnly": false
    }' \
    --query 'UserPool.Id' --output text)
  echo "  Created: $POOL_ID"
fi

# ─────────────────────────────────────────────────────────
# 2. Create App Clients (no secret — SPA public clients)
# ─────────────────────────────────────────────────────────
echo ""
echo "[2/6] Creating App Clients..."

create_client() {
  local CLIENT_NAME="$1"

  EXISTING=$(aws cognito-idp list-user-pool-clients --user-pool-id "$POOL_ID" --region "$REGION" \
    --query "UserPoolClients[?ClientName=='${CLIENT_NAME}'].ClientId | [0]" --output text 2>/dev/null || echo "None")

  if [ "$EXISTING" != "None" ] && [ -n "$EXISTING" ]; then
    echo "  Client '$CLIENT_NAME' exists: $EXISTING"
    echo "$EXISTING"
    return
  fi

  local CID
  CID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --region "$REGION" \
    --no-generate-secret \
    --explicit-auth-flows \
      ALLOW_USER_SRP_AUTH \
      ALLOW_REFRESH_TOKEN_AUTH \
    --id-token-validity 8 \
    --access-token-validity 8 \
    --refresh-token-validity 30 \
    --token-validity-units '{
      "IdToken":"hours",
      "AccessToken":"hours",
      "RefreshToken":"days"
    }' \
    --read-attributes '["email","name","custom:azh_user_id"]' \
    --write-attributes '["email","name"]' \
    --query 'UserPoolClient.ClientId' --output text)

  echo "  Created '$CLIENT_NAME': $CID"
  echo "$CID"
}

INTERFACE_CLIENT_ID=$(create_client "$INTERFACE_CLIENT_NAME")
ADMIN_CLIENT_ID=$(create_client "$ADMIN_CLIENT_NAME")

# ─────────────────────────────────────────────────────────
# 3. Create Groups (map to RBAC roles)
# ─────────────────────────────────────────────────────────
echo ""
echo "[3/6] Creating Groups..."

for GROUP in admin clinician family; do
  aws cognito-idp get-group --group-name "$GROUP" \
    --user-pool-id "$POOL_ID" --region "$REGION" >/dev/null 2>&1 || \
  aws cognito-idp create-group \
    --group-name "$GROUP" \
    --user-pool-id "$POOL_ID" \
    --region "$REGION" \
    --description "AlzheimerVoice ${GROUP} role" >/dev/null
  echo "  Group: $GROUP"
done

# ─────────────────────────────────────────────────────────
# 4. Seed Demo Users
# ─────────────────────────────────────────────────────────
echo ""
echo "[4/6] Seeding demo users..."

SEED_PASSWORD="Demo1234"

seed_user() {
  local EMAIL="$1"
  local NAME="$2"
  local GROUP="$3"
  local AZH_ID="$4"

  # Create user (suppress error if already exists)
  aws cognito-idp admin-create-user \
    --user-pool-id "$POOL_ID" \
    --username "$EMAIL" \
    --user-attributes \
      Name=email,Value="$EMAIL" \
      Name=email_verified,Value=true \
      Name=name,Value="$NAME" \
      Name=custom:azh_user_id,Value="$AZH_ID" \
    --message-action SUPPRESS \
    --region "$REGION" 2>/dev/null || true

  # Set permanent password
  aws cognito-idp admin-set-user-password \
    --user-pool-id "$POOL_ID" \
    --username "$EMAIL" \
    --password "$SEED_PASSWORD" \
    --permanent \
    --region "$REGION" 2>/dev/null || true

  # Add to group
  aws cognito-idp admin-add-user-to-group \
    --user-pool-id "$POOL_ID" \
    --username "$EMAIL" \
    --group-name "$GROUP" \
    --region "$REGION" 2>/dev/null || true

  echo "  $EMAIL ($GROUP) -> azh_id=$AZH_ID"
}

seed_user "admin@memovoice.ai"  "Super Admin"         admin     u1
seed_user "remi@memovoice.ai"   "Dr. Remi Francois"   clinician u2
seed_user "sophie@memovoice.ai" "Dr. Sophie Martin"    clinician u3
seed_user "pierre@famille.fr"   "Pierre Dupont"        family    u4
seed_user "mc@famille.fr"       "Marie-Claire Petit"   family    u5
seed_user "jean@memovoice.ai"   "Jean Administrateur"  admin     u6

# ─────────────────────────────────────────────────────────
# 5. Verify
# ─────────────────────────────────────────────────────────
echo ""
echo "[5/6] Verifying..."

USER_COUNT=$(aws cognito-idp list-users --user-pool-id "$POOL_ID" --region "$REGION" \
  --query 'length(Users)' --output text 2>/dev/null || echo "?")
echo "  Users in pool: $USER_COUNT"

GROUP_COUNT=$(aws cognito-idp list-groups --user-pool-id "$POOL_ID" --region "$REGION" \
  --query 'length(Groups)' --output text 2>/dev/null || echo "?")
echo "  Groups in pool: $GROUP_COUNT"

# ─────────────────────────────────────────────────────────
# 6. Output
# ─────────────────────────────────────────────────────────
echo ""
echo "[6/6] Done!"
echo ""
echo "============================================"
echo "  Cognito Setup Complete"
echo "============================================"
echo ""
echo "Add to .env.development and .env.production:"
echo ""
echo "  # Backend (services/api)"
echo "  COGNITO_USER_POOL_ID=$POOL_ID"
echo "  COGNITO_REGION=$REGION"
echo "  COGNITO_INTERFACE_CLIENT_ID=$INTERFACE_CLIENT_ID"
echo "  COGNITO_ADMIN_CLIENT_ID=$ADMIN_CLIENT_ID"
echo ""
echo "  # Frontend (apps/interface + apps/admin)"
echo "  VITE_COGNITO_USER_POOL_ID=$POOL_ID"
echo "  VITE_COGNITO_REGION=$REGION"
echo "  VITE_COGNITO_INTERFACE_CLIENT_ID=$INTERFACE_CLIENT_ID"
echo "  VITE_COGNITO_ADMIN_CLIENT_ID=$ADMIN_CLIENT_ID"
echo ""
echo "Demo login: any seeded email with password '$SEED_PASSWORD'"
echo "============================================"
