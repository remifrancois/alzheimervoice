# Security Checklist — MemoVoice CVF Engine

## ✅ Repository Security

- **Visibility**: PRIVATE ✓
- **Branch Protection**: v1 branch with main
- **API Keys**: Never committed ✓
  - `.env` file in `.gitignore` at root and server level
  - Git history scanned — no secrets found
  - `.env.example` provided as template

## 🔐 Environment Variables

### Never commit:
- `ANTHROPIC_API_KEY` — Claude API credentials
- Any database credentials
- Internal tokens or secrets

### Safe setup:
```bash
# Copy template
cp server/.env.example server/.env

# Add your API key (ONLY locally, never commit)
echo "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE" >> server/.env

# Verify .env is ignored
git check-ignore server/.env  # Should return: server/.env
```

### Verification:
```bash
# Ensure no secrets in git history
git log --all -p | grep -i "sk-ant\|api_key\|secret"
# Should return nothing
```

## 🛡️ Data Security

- **Patient Data**: JSON files in `data/` directory (NOT in git)
- **Demo Data**: Pre-generated, non-sensitive test data only
- **Clinical Records**: Store securely outside this repo
- **HIPAA Compliance**: Encrypt patient data at rest if deploying to production

## 🚀 Deployment Security

Before deploying to production:

1. **Set environment variables** via secure secrets manager:
   ```bash
   # Use GitHub Secrets (for CI/CD) or environment variable manager
   export ANTHROPIC_API_KEY=sk-ant-...
   ```

2. **Enable HTTPS/TLS**:
   - Dashboard should only run over HTTPS
   - API server should require HTTPS in production

3. **Add authentication**:
   - Protect API endpoints with API keys or OAuth
   - Add session management to dashboard

4. **Database security**:
   - If moving from JSON to a real database, encrypt at rest
   - Use parameterized queries to prevent SQL injection

5. **Rate limiting**:
   - Add rate limiting to `/api/cvf/process` endpoint
   - Prevent API abuse

## 📋 Checklist for Production

- [ ] Change `server/.env.example` to remove any example credentials
- [ ] Enable branch protection on GitHub (require PR reviews)
- [ ] Add GitHub secret scanning
- [ ] Rotate API keys regularly
- [ ] Set up audit logging for API calls
- [ ] Encrypt patient data at rest
- [ ] Use HTTPS only
- [ ] Add API authentication/authorization
- [ ] Set up monitoring and alerting
- [ ] Document data retention policies

## 📞 Security Contacts

If you find a security vulnerability, do NOT open a public issue.

Contact: remifrancois [at] github

---

**Last Updated**: 2026-02-11
**Status**: Development (Private)
