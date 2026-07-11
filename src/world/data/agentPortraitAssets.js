// UI-only portrait contract for the twelve user-supplied Hermes agents.
// These high-detail illustrations belong in profile cards, sheets and panels.
// Map renderers must use mapAgentManifest.js instead.
export const AGENT_PORTRAIT_MANIFEST = Object.freeze({
  orchestrator: '/heroes/hero-01.webp', // Kasztelan
  prospecting: '/heroes/hero-02.webp',  // Zwiadowca
  developer: '/heroes/hero-03.webp',    // Architekt
  coder: '/heroes/hero-04.webp',        // Budowniczy / AI Forge
  devops: '/heroes/hero-05.webp',       // Strażnik / SecOps
  reviewer: '/heroes/hero-06.webp',     // Uzdrowiciel / auto-heal review
  synthesizer: '/heroes/hero-07.webp',  // Alchemik
  researcher: '/heroes/hero-08.webp',   // Kronikarz
  default: '/heroes/hero-09.webp',      // Prorok / general analyst
  outreach: '/heroes/hero-10.webp',     // Dyplomata
  komandos: '/heroes/hero-11.webp',     // Komandos
  verifier: '/heroes/hero-12.webp',     // Włócznik / watcher
})

const PORTRAIT_URLS = Object.freeze(Object.values(AGENT_PORTRAIT_MANIFEST))

export const HERMES_HERO_PROFILES = Object.freeze(Object.keys(AGENT_PORTRAIT_MANIFEST))

export function isAgentPortraitAssetUrl(url) {
  const normalized = String(url ?? '').split(/[?#]/, 1)[0]
  return PORTRAIT_URLS.includes(normalized) || normalized.includes('/heroes/')
}

export function getAgentPortraitAsset(profile) {
  return AGENT_PORTRAIT_MANIFEST[profile] ?? AGENT_PORTRAIT_MANIFEST.default
}
