#!/bin/bash
set -euo pipefail
exec > /var/log/cvf-setup.log 2>&1

echo "=== CVF Engine V5 Setup on Graviton ==="

# System packages
apt-get update
apt-get install -y ffmpeg python3-pip python3-venv git curl debian-keyring debian-archive-keyring apt-transport-https

# Node.js 20 (ARM64)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Caddy (reverse proxy with auto-SSL)
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Python deps (CPU-only torch for ARM64)
pip3 install --break-system-packages torch --index-url https://download.pytorch.org/whl/cpu
pip3 install --break-system-packages openai-whisper parselmouth librosa nolds numpy

# Clone repo
cd /home/ubuntu
sudo -u ubuntu git clone https://github.com/remifrancois/alzheimervoice.git
cd alzheimervoice

# Install Node deps for CVF service + workspace deps it needs
sudo -u ubuntu npm install --prefix services/cvf

# Systemd service for CVF engine
cat > /etc/systemd/system/cvf.service <<EOF
[Unit]
Description=CVF Engine V5 deep_voice
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/alzheimervoice
ExecStart=/usr/bin/node services/cvf/src/index.js
Environment=CVF_PORT=3002
Environment=SITE_URL=https://alzheimervoice.org
Environment=API_URL=https://api.alzheimervoice.org
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cvf
systemctl start cvf

# Caddy config (will auto-provision SSL once DNS points here)
cat > /etc/caddy/Caddyfile <<EOF
cvf.alzheimervoice.org {
    reverse_proxy localhost:3002
}
EOF

systemctl restart caddy

echo "=== CVF Engine setup complete ==="
