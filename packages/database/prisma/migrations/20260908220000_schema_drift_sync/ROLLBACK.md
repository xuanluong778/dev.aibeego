# Rollback — 20260908220000_schema_drift_sync

Backward-compatible rollback (additive migration only):

```sql
DROP TABLE IF EXISTS "organization_activation_events";

ALTER TABLE "marketing_autopilot_guardrails"
  DROP COLUMN IF EXISTS "cooldown_minutes",
  DROP COLUMN IF EXISTS "emergency_stop";
```

Do **not** drop work_time_logs, work_audit_logs, or content_teleprompter_recordings — those belong to earlier migrations.
