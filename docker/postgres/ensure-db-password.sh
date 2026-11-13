#!/bin/sh
# Đồng bộ mật khẩu role postgres trong volume với POSTGRES_PASSWORD (sau recreate container).
# Chạy trong container postgres khi API báo "Authentication failed".
set -eu
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  echo "POSTGRES_PASSWORD empty — skip"
  exit 0
fi
psql -U "${POSTGRES_USER:-marketingspa}" -d "${POSTGRES_DB:-marketingspa}" -v ON_ERROR_STOP=1 \
  -c "ALTER USER \"${POSTGRES_USER:-marketingspa}\" WITH PASSWORD '${POSTGRES_PASSWORD}';"
echo "Password synced for ${POSTGRES_USER:-marketingspa}"
