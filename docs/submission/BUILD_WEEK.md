# OpenAI Build Week Disclosure

Hermes OS was not presented as an empty-directory build. The project started immediately after the GPT-5.6 preview and had a documented product foundation before the submission period. The Build Week work meaningfully extended and completed that foundation.

## Before the submission period

The documented baseline established:

- the product thesis: a spatial, mobile-first interface for agent observability;
- the initial map and visual direction;
- the first worker/profile and data mappings;
- an isolated technical shell derived from Hermes OS CAT without modifying the working CAT application.

Baseline reference: `b80b89d` (`pre-build-week/environmental-world-life`).

## Built and completed during Build Week

- Real Hermes gateway/state-database event watcher.
- Privacy-reduced JSONL bridge and Node event forwarder.
- Validated Express ingestion, deduplication, bounded persistence and SSE replay.
- Shared client event lifecycle with reconnect and authoritative resynchronization.
- Full worker choreography from assignment through travel, work and return.
- Telemetry-driven environmental state and subsystem interiors.
- Semantic Citadel Activity for named tasks, important events and cron success/error outcomes.
- Mobile lifecycle, Wi-Fi/LTE, cold-start, reconnect and repeated-cycle validation.
- Release freeze, rollback plan, production promotion and validation evidence.
- Dated journal, Codex session register, architecture decisions, tests and privacy/IP records.

Validated release: `c18bc52dfde75395549d41ea4cebdcdef745546f`.

Documented Git range: `b80b89d..c18bc52`.

## AI collaboration

GPT-5.6 in Codex supported architecture, implementation, debugging, testing, performance checks, browser validation, release evidence and documentation. ChatGPT image generation supported original visual references and effect sources. Generated material was reviewed, normalized, integrated and tested by the project owner.

Human decisions remained authoritative for product scope, real-device validation, production approval and the final submission narrative.

## Evidence

- `docs/build-week/01_PROVENANCE_I_BASELINE_PL.md`
- `docs/build-week/02_DZIENNIK_BUILD_WEEK_PL.md`
- `docs/build-week/03_SESJE_CODEX_PL.md`
- `docs/build-week/04_REJESTR_DECYZJI_PL.md`
- `docs/build-week/05_ARCHITEKTURA_I_ZMIANY_PL.md`
- `docs/build-week/06_TESTY_I_STABILNOSC_PL.md`
- `docs/build-week/evidence/`

These are the original contemporaneous records and remain in Polish. This file is the concise English judge-facing disclosure.
