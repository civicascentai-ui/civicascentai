# Issue #22 — Private-data encrypted backup and isolated restore gate

**Status:** PREPARED; NO private-data export or decryptable recovery point has been created. **Owner policy:** budget $0, Monday–Saturday incrementals and Sunday independently restorable full backups, both production and shadow, with recovery-key custody separate from the vault.

## Verified environment boundary (2026-10-16)

- The actual published website uses GitHub Pages; the separate Vercel shadow preview is READY at the same Git SHA, but authenticated page functionality is not independently proven.
- The connected Supabase organization is on the **Free plan**, so do not assume plan-provided daily recoverable backups. Supabase recommends regular offsite `supabase db dump` or `pg_dump` exports for Free projects: <https://supabase.com/docs/guides/platform/backups>.
- RAG Phase 1 **Test** has seven public RLS-enabled tables, four additional private-checkout tables, 18 migrations, six Edge Functions and no reported storage objects.
- Course Commerce **QA Staging** has four public RLS-enabled tables, eight migrations, six Edge Functions and one bucket with approximately two objects. Both projects are healthy, but **neither has been proven a production dependency**, and **no database/data/Storage backup or restore has been verified**.
- Vercel preview has encrypted/Sensitive environment settings related to Supabase and Stripe. **Never decrypt/print them here or put their values in a GitHub issue, CI log, repository, or Drive document.** Their mere presence is not a successful recovery.

## Encryption and key custody — P0 fail-closed requirement

The owner-only Drive folder `CivicAscent AI - PRIVATE Disaster Recovery Backups (Encrypted Only)` already has separate **PRODUCTION**, **SHADOW HOUSE** and non-sensitive **RESTORE RECEIPTS** subfolders. Folder access was reported owner-only. Its control register expressly requires an **offline/owner-held decryption key**. No existing owner-controlled public recipient key was found and no encrypted private-data payload has been uploaded. **Do not use the ordinary unencrypted Git-code-only Drive folder for database or uploaded content.**

The repository's `tools/p0_backup_crypto.sh` requires an **already imported owner public GnuPG key fingerprint** and encrypts only on a trusted local host. It does not create, handle, export or upload private keys. To use it with real data, the owner/authorized operator must first:

1. **On an owner-controlled computer, offline or otherwise trusted**, generate a strong passphrase-protected encryption-capable OpenPGP key with GnuPG. Retain the **private key and passphrase outside GitHub, ChatGPT and Google Drive**, with an independently protected emergency-recovery copy. Never send either to an agent or chat. Export **only the public key** to the trusted backup operator/runner, along with its verified *full* fingerprint.
2. Establish a controlled temporary backup workspace (encrypted local disk / protected temp directory) and **read-only/least-privilege database export access**. Verify the exact database(s) supporting real operations. No extra Supabase projects or paid branches should be created.
3. Export complete **schema + rows + migration history + necessary roles/config inventory** from each confirmed in-scope database with a supported PostgreSQL/Supabase-native dump tool. Include functions separately where database dump does not cover them. Export Storage object contents separately from their database metadata. Preserve object counts, names/integrity hashes and access-control settings in an **encrypted** manifest.
4. Encrypt every unprotected archive **before** any upload with an authenticated encrypting tool, e.g.:

   `bash tools/p0_backup_crypto.sh encrypt /trusted/local/export.dump /trusted/local/export.dump.gpg VERIFIED_FULL_PUBLIC_FINGERPRINT`

   No real data is sent to GitHub Actions, public artifacts, ChatGPT, or ordinary Google Drive. Before uploading, verify ciphertext integrity and a **successful owner-key decrypt+restore in an isolated trusted environment**. Delete local plaintext according to the operator's secure deletion policy; do not claim SSD plaintext deletion merely because a shell command removed a file.
5. Upload **encrypted-only** files to the matching owner-only Drive vault folder; verify recipient fingerprints, ciphertext SHA-256, sizes, file metadata and private permissions. Record **non-sensitive receipts only** in the vault RESTORE RECEIPTS folder: environment, scope, SHA, timestamp, cadence, location, checksum, key ID/fingerprint (public identifier), retention, independently tested restore and reviewer.
6. Test *both* the actual data and Storage restores in an isolated protected Postgres and private-object store, including expected schema and record counts, private function metadata, provider integration settings and separate rollback; record measured RPO/RTO without publishing row values. Never replay Stripe webhooks or real checkout events into production.

## Synthetic encryption test supplied in PR #139

`tests/test_p0_encrypted_restore.py` creates **disposable CI-only RSA test identities** and synthetic bytes. It exercises `tools/p0_backup_crypto.sh`, then verifies byte-identical decrypt with the proper key; wrong key, ciphertext tampering, truncation, overwrite attempts and missing public key must all fail without leaving recovered plaintext outputs. Test keys and fake data are discarded by the CI runner. **This proves the encryption wrapper behavior, not real protected-data backup or data restore.**

## Mandatory block if no owner-held recovery key exists

**Stop before fetching real private rows or Storage objects.** Do not generate a sole private key in ChatGPT's temporary environment, place any private key in a public GitHub repository, use a chat message as the only recovery-key storage, or upload plaintext to an "Encrypted Only" folder. A backup without an independently retained usable decryption key is **not** a recoverable backup.

### Current disposition

`CODE_RECOVERY=PASS`, `OFF_PROVIDER_GIT_CODE_COPY=PASS`, `SYNTHETIC_OPENPGP_TEST=PENDING`, `PRIVATE_DATA_ENCRYPTED_BACKUP=NOT_VERIFIED`, `OFFLINE_OWNER_KEY=NOT_VERIFIED`, `ISOLATED_PROTECTED_DATABASE_RESTORE=NOT_VERIFIED`, `FULL_DR_READY=false`.

Track evidence in [issue #22](https://github.com/civicascentai-ui/civicascentai/issues/22) and keep [PR #139](https://github.com/civicascentai-ui/civicascentai/pull/139) DRAFT pending separate release approval.
