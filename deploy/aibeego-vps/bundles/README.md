# Web bundles (not in git)

Versioned Next `tmp/aibeego-next` trees for promote / rollback without DB restore.

Create with:

```bash
node scripts/aibeego-web-bundle-archive.cjs
node scripts/aibeego-web-bundle-archive.cjs --label rollback-1b5032b --source /path/to/tmp/aibeego-next
```

Activate for QA recreate test:

```bash
node scripts/aibeego-web-bundle-link-current.cjs --bundle <dir-name>
node scripts/test-aibeego-web-bundle-recreate.cjs
```

Production promote (when approved): see `deploy/aibeego-vps/README.md` — bind mount or image rebuild; **do not** rely on manual `docker cp` alone.
