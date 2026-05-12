#!/bin/sh
set -eu

cat > /usr/share/nginx/html/assets/env.js <<EOF
window.__env = {
  apiUrl: "${API_URL}"
};
EOF
