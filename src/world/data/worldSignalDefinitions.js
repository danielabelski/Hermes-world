/** Stable, renderer-neutral visual tokens for non-agent world signals. */

const freeze = (value) => Object.freeze(value);

export const PROVIDER_CRYSTAL_VISUALS = freeze({
  openai: freeze({ crystalType: 'emerald', color: '#48B99C' }),
  anthropic: freeze({ crystalType: 'amber', color: '#D89A59' }),
  google: freeze({ crystalType: 'sapphire', color: '#6587D7' }),
  ollama: freeze({ crystalType: 'amethyst', color: '#9B73C9' }),
  local: freeze({ crystalType: 'amethyst', color: '#9B73C9' }),
  unknown: freeze({ crystalType: 'quartz', color: '#91A2AC' }),
});

export const ALERT_VISUALS = freeze({
  info: freeze({ severity: 'info', icon: 'spark', effect: 'none', color: '#78BBC7' }),
  warning: freeze({ severity: 'warning', icon: 'exclamation', effect: 'caution-pulse', color: '#D7A846' }),
  error: freeze({ severity: 'error', icon: 'alert', effect: 'smoke', color: '#D45B4D' }),
  critical: freeze({ severity: 'critical', icon: 'alert', effect: 'storm-pulse', color: '#D44339' }),
});

export function getProviderCrystal(provider) {
  const key = String(provider ?? 'unknown').trim().toLowerCase();
  return PROVIDER_CRYSTAL_VISUALS[key] ?? PROVIDER_CRYSTAL_VISUALS.unknown;
}

export function getAlertVisual(level) {
  const key = String(level ?? 'info').trim().toLowerCase();
  if (key === 'fatal') return ALERT_VISUALS.critical;
  return ALERT_VISUALS[key] ?? ALERT_VISUALS.info;
}
