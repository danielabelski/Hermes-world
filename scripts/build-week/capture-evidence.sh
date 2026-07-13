#!/usr/bin/env bash
set -euo pipefail

# Read-only względem Git i kodu aplikacji. Jedyny zapis to nowy plik snapshotu
# w docs/build-week/evidence/git-snapshots/.

BASELINE="b80b89d771457e6d6c515cda51e4d480f85245e1"
SESSION_ID=""
GOAL=""

usage() {
  printf '%s\n' \
    "Użycie: $0 [--session-id ID] [--goal TEKST] [--baseline COMMIT_LUB_TAG]" \
    "Tworzy lokalny snapshot metadanych Git. Nie commituję, nie pushuję i nie czytam .env."
}

while (($#)); do
  case "$1" in
    --session-id)
      [[ $# -ge 2 ]] || { printf 'Brak wartości dla --session-id\n' >&2; exit 2; }
      SESSION_ID="$2"
      shift 2
      ;;
    --goal)
      [[ $# -ge 2 ]] || { printf 'Brak wartości dla --goal\n' >&2; exit 2; }
      GOAL="$2"
      shift 2
      ;;
    --baseline)
      [[ $# -ge 2 ]] || { printf 'Brak wartości dla --baseline\n' >&2; exit 2; }
      BASELINE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Nieznany argument: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

OUT_DIR="$ROOT/docs/build-week/evidence/git-snapshots"
[[ -d "$OUT_DIR" ]] || { printf 'Brak katalogu snapshotów: %s\n' "$OUT_DIR" >&2; exit 1; }

UTC_FILE="$(date -u '+%Y%m%dT%H%M%SZ')"
UTC_ISO="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
# POSIX rule avoids relying on an optional tzdata database in Git Bash/Windows.
WARSAW_ISO="$(TZ='CET-1CEST,M3.5.0,M10.5.0/3' date '+%Y-%m-%dT%H:%M:%S%:z')"
OUT="$OUT_DIR/${UTC_FILE}-git-snapshot.txt"

umask 077
(
  printf 'HERMES WORLD — BUILD WEEK GIT SNAPSHOT\n'
  printf 'UTC: %s\n' "$UTC_ISO"
  printf 'Europe/Warsaw: %s\n' "$WARSAW_ISO"
  printf 'Session ID: %s\n' "${SESSION_ID:-nie podano}"
  printf 'Cel: %s\n' "${GOAL:-nie podano}"
  printf 'Branch: %s\n' "$(git branch --show-current)"
  printf 'HEAD: %s\n' "$(git rev-parse HEAD)"
  printf 'Baseline ref: %s\n' "$BASELINE"

  printf '\n== git status --short ==\n'
  git status --short --untracked-files=all

  printf '\n== Zmienione pliki (bez treści) ==\n'
  git status --short --untracked-files=all
  git diff --name-status
  git diff --cached --name-status

  printf '\n== Diff stat: working tree ==\n'
  git diff --stat

  printf '\n== Diff stat: staged ==\n'
  git diff --cached --stat

  printf '\n== Ostatnie commity ==\n'
  git log -n 20 --date=iso-strict --format='%H%x09%aI%x09%cI%x09%s'

  printf '\n== Commity od baseline ==\n'
  if git rev-parse --verify --quiet "${BASELINE}^{commit}" >/dev/null; then
    git log "${BASELINE}..HEAD" --date=iso-strict --format='%H%x09%aI%x09%cI%x09%s'
  else
    printf 'Nie można rozwiązać baseline: %s\n' "$BASELINE"
  fi

  printf '\n== Tagi Build Week ==\n'
  git tag --list '*build-week*' --format='%(refname:short)%09%(objectname)%09%(creatordate:iso-strict)%09%(contents:subject)'
) > "$OUT"

printf 'Zapisano snapshot: %s\n' "$OUT"
