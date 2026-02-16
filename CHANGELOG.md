# Changelog

All notable changes to the AlzheimerVoice project.

## [Unreleased] — 2026-02-16

### CVF Engine
- CORS: added `alzheimervoice.org`, `www.alzheimervoice.org`, and Vercel preview domains to allowed origins
- Demo-analyze endpoint: early memory release of `audioBase64` and `audioBuffer` after processing
- Demo-analyze endpoint: completion log confirming no data retained after analysis
- Deployed CVF Engine V5.2 to AWS EC2 Graviton (`t4g.small`, ARM64) at `cvf.alzheimervoice.org`
- Caddy reverse proxy with auto-SSL for `cvf.alzheimervoice.org`
- Systemd service (`cvf`) for automatic restart and boot persistence

### Site (`apps/site`)
- Demo page: language selector (French / English) for voice recording
- Demo page: acoustic summary section in results (F0, jitter, shimmer, HNR)
- Demo page: "data deleted" confirmation banner after analysis completes
- Demo page: "How the Demo Works" 4-step visual explaining the no-storage pipeline
- Demo page: scroll-to-results on analysis completion
- Demo page: explicit audio chunk cleanup on client side after sending
- Demo page: processing pipeline visualization during analysis
- Demo page: privacy notice updated — explains direct-to-server, in-memory processing, no S3
- Demo page: protocol section redesigned as 2×4 grid with family memories and mobile app cards
- Family page: added Prevention & Treatment modes section (daily/weekly calls, family memories, cognitive stimulation)
- Family page: updated CTA with "Register as a Family" + "Open Source on GitHub" buttons
- Open Source page: added two GitHub repo cards (hackathon source + core CVF engine)
- Open Source page: updated SaaS section — removed "clinical support", CTA points to registration
- Creators page: "Remi K." → "Rémi F.", co-creator "to be announced soon", 6-day hackathon with $500 Opus API tokens
- Navbar: full-width layout, responsive mobile menu with full-screen overlay + body scroll lock
- Navbar: `/cognitivevoicefingerprint` → `/science`, `/corevoiceframework` → `/cognitivevoicefingerprint`
- Navbar: "Cognitive Voice Fingerprint" → "Science Research", added "CVF Engine V5" menu item
- Navbar: "How it works for Family" → "For Family", removed `animate-pulse` from Hackathon Demo button
- Footer: updated links to match new URL structure
- i18n: all V4 → V5 references updated (85 indicators → 107, 23 rules → 35, 47 → 85 indicators in descriptions)
- CoreVoiceFrameworkPage: comparison table updated from V3→V4 to V4→V5
- Fixed: MemoVoice → AlzheimerVoice branding in demo results footer
- Fixed: `replace(/_/)` → `replace(/_/g)` for condition name display

### Demo App (`apps/demo`)
- Removed admin user from settings page
- Fixed branding: MemoVoice → AlzheimerVoice in email references

### Admin App (`apps/admin`)
- Fixed blank page: added missing `<I18nProvider>` wrapper in `main.jsx`

### General
- All apps: updated favicons and HTML titles
- `.gitignore`: changed `data/` to `/data/` (root-only) to fix Vercel deployment
- Merged `/demo` and `/trydemo` pages on site
- Pushed to both remotes: `hackathon` (github.com/remifrancois/alzheimervoice) and `origin` (github.com/remifrancois/azh)
