#!/usr/bin/env bash
# CivicAscent P0: owner-key-only OpenPGP encryption and verified local restore.
# Never uploads files, handles credentials or generates private keys.
# Encrypt: bash tools/p0_backup_crypto.sh encrypt input.dump output.dump.gpg FINGERPRINT
# Recover: bash tools/p0_backup_crypto.sh decrypt input.dump.gpg restored.dump
set -euo pipefail
umask 077
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $# -ge 3 && $# -le 4 ]] || die "usage: encrypt INPUT OUTPUT PUBLIC_FINGERPRINT | decrypt CIPHERTEXT OUTPUT"
mode=$1 input=$2 output=$3
[[ -f "$input" && ! -L "$input" && -s "$input" ]] || die "input must be an existing nonempty regular file (no symlinks)"
[[ ! -e "$output" && ! -L "$output" ]] || die "refusing to overwrite output"
[[ -d "$(dirname -- "$output")" ]] || die "output parent must exist"
command -v gpg >/dev/null 2>&1 || die "GnuPG is required"
case "$mode" in
  encrypt)
    [[ $# -eq 4 ]] || die "recipient public key fingerprint required"
    fingerprint="$(printf '%s' "$4" | tr '[:lower:]' '[:upper:]')"
    [[ "$fingerprint" =~ ^[0-9A-F]{40,64}$ ]] || die "full public key fingerprint required (not email or short ID)"
    gpg --batch --no-tty --list-keys "$fingerprint" >/dev/null 2>&1 || die "recipient public key missing from local keyring"
    ;;
  decrypt)
    [[ $# -eq 3 ]] || die "decrypt takes ciphertext and output only"
    ;;
  *) die "unknown mode" ;;
esac
tmp="$(mktemp "$output".partial.XXXXXXXX)" || die "unable to create protected temporary output"
cleanup() { rm -f -- "$tmp"; }
trap cleanup EXIT
if [[ "$mode" == encrypt ]]; then
  gpg --batch --no-tty --trust-model always --recipient "$fingerprint" \
    --compress-algo none --encrypt --output "$tmp" -- "$input" ||
    die "encryption failed; source untouched"
else
  gpg --batch --no-tty --decrypt --output "$tmp" -- "$input" ||
    die "authentication/decryption failed; discarded temporary output"
fi
[[ -s "$tmp" ]] || die "empty cipher or restore refused"
[[ ! -e "$output" && ! -L "$output" ]] || die "output appeared during operation; refusing overwrite"
mv -n -- "$tmp" "$output" || die "unable to commit verified output"
trap - EXIT
printf '%s OK: protected output written at destination; no upload attempted\n' "$mode"
