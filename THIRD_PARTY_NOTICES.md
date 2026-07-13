# Third-Party Notices

This file documents third-party components used by or interoperating with Hermes World. It does **not** license Hermes World itself. Hermes World remains private and proprietary; all rights to its original code are reserved by its owner.

Versions below are taken from `package-lock.json` audited on 2026-07-13. Upstream license files and copyright notices must not be removed when the corresponding component is redistributed.

## Runtime dependencies

| Component | Locked version | License | Use |
|---|---:|---|---|
| compression | 1.8.1 | MIT | HTTP response compression |
| express | 5.2.1 | MIT | Local application server/API |
| http-proxy-middleware | 4.1.1 | MIT | Backend proxy integration |
| pixi.js | 8.19.0 | MIT | World rendering |
| react | 19.2.7 | MIT | UI runtime |
| react-dom | 19.2.7 | MIT | DOM renderer |
| web-push | 3.6.7 | MPL-2.0 | Push notification support |
| zustand | 5.0.14 | MIT | Client state management |

## Development dependencies

| Component | Locked version | License |
|---|---:|---|
| @eslint/js | 10.0.1 | MIT |
| @types/react | 19.2.17 | MIT |
| @types/react-dom | 19.2.3 | MIT |
| @vitejs/plugin-react | 6.0.2 | MIT |
| eslint | 10.5.0 | MIT |
| eslint-plugin-react-hooks | 7.1.1 | MIT |
| eslint-plugin-react-refresh | 0.5.3 | MIT |
| globals | 17.6.0 | MIT |
| vite | 8.0.16 | MIT |

## Image-processing development tool

The deterministic asset scripts `scripts/normalize_hero_assets.py` and `scripts/process-map-agent-sheet.py` use Pillow. The audited local version was Pillow 12.2.0, licensed under the MIT-CMU license. Pillow is a development tool and is not imported by the browser/server application bundle.

- Project: https://github.com/python-pillow/Pillow
- License: https://github.com/python-pillow/Pillow/blob/main/LICENSE
- Copyright notices in the Pillow license must be preserved when Pillow itself is redistributed.

## Relevant transitive license groups

The lockfile contains the following declared license distribution: 214 MIT packages, 15 Apache-2.0, 15 ISC, 13 MPL-2.0, 6 BSD-3-Clause, 6 BSD-2-Clause, 1 CC-BY-4.0, 1 BlueOak-1.0.0 and 1 0BSD.

Notable transitive components requiring deliberate notice handling:

- `caniuse-lite` 1.0.30001799 — CC-BY-4.0.
- `lightningcss` 1.32.0 and its platform packages — MPL-2.0.
- `web-push` 3.6.7 — MPL-2.0.

`package-lock.json` is the exhaustive machine-readable version inventory. Installed npm packages retain their upstream `LICENSE` files. Before distributing a standalone compiled bundle outside the private judging repository, regenerate an exhaustive license report and include all required copyright and license texts.

## Hermes Agent by Nous Research

Hermes World interoperates with an independently installed Hermes Agent runtime through the `hermes` CLI, journal/SSE data and HTTP boundaries. Audit found no vendored `hermes-agent` package, submodule or copied Hermes Agent source files in this repository.

- Project: https://github.com/NousResearch/hermes-agent
- License: MIT, copyright © 2025 Nous Research
- License source: https://github.com/NousResearch/hermes-agent/blob/main/LICENSE

Because Hermes Agent source or binaries are not redistributed as part of this repository, its full MIT license is not copied into application source. This attribution records the external interoperability dependency. If a future release bundles or copies Hermes Agent, its copyright and complete MIT license text must accompany that material.

## First-party pre-existing code

Hermes OS CAT is an earlier project owned by the same project owner. Hermes World reused and modified its technical shell. It is not treated as a third-party open-source dependency. The exact first-party inheritance is documented in `docs/build-week/11_POCHODZENIE_KODU_PL.md` so that pre-existing work remains distinguishable from Build Week work.

## Assets

Asset provenance is maintained separately in `docs/build-week/ASSET_PROVENANCE_PL.md`. The project owner confirms that all visual assets in Hermes World and Hermes OS CAT were generated from scratch by AI models on the owner's instruction specifically for these projects. No external stock, game, marketplace, repository or asset-pack source was identified. A missing historical prompt or Session ID limits evidentiary detail but does not change that first-party provenance statement.
