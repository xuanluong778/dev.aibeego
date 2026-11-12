#!/bin/sh
set -e
ln -sfn /app/public /app/apps/web/public
rm -rf /app/apps/web/.next/cache/images
# Bản build trong image vẫn đóng chữ thương hiệu cũ. Đổi chữ hiển thị mỗi lần khởi động.
# File mount read-only đã được vá trên host; bỏ qua nếu không ghi được.
# Production server.js uses distDir tmp/aibeego-next — avoid sed on legacy .next/standalone (huge, blocks startup).
find /app/apps/web/tmp/aibeego-next -type f \
  \( -name '*.js' -o -name '*.html' -o -name '*.rsc' -o -name '*.body' -o -name '*.json' -o -name '*.txt' \) \
  ! -path '*/node_modules/*' |
while IFS= read -r f; do
  sed -i \
    -e 's/Marketing Auto AZ/Ai Bee Go/g' \
    -e 's/MarketingAutoAZ/Ai Bee Go/g' \
    -e 's/marketingautoaz\.com/aibeego.com/g' \
    "$f" 2>/dev/null || true
done
node /web-api-proxy.js &
exec docker-entrypoint.sh node apps/web/server.js
