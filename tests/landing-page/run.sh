#!/usr/bin/env bash
# Chạy bộ test Landing Page.  Dùng:  tests/landing-page/run.sh [unit|api|all] [mẫu-tên-tệp]
# - unit: chỉ chạy phần không cần máy chủ (mặc định, an toàn, chạy được ngay)
# - api / all: cần LP_API_BASE và tài khoản test (xem README.md)
set -euo pipefail
cd "$(dirname "$0")/../../packages/database"
mode="${1:-unit}"; pat="${2:-}"
files=(../../tests/landing-page/suites/${pat}*.test.ts)
[ "$mode" = "unit" ] && unset LP_API_BASE LP_WEB_BASE || true
exec npx tsx --test --test-reporter=spec "${files[@]}"
