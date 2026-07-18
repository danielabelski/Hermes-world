export function resolveDemoRuntimeMode(search = '', envDemo = false) {
  const params = new URLSearchParams(search)
  const focus = params.get('focus') ?? 'auto'
  const fixtureMode = Boolean(envDemo) || params.get('fixture') === '1' || focus !== 'auto'
  return Object.freeze({
    focus,
    scenario: params.get('scenario') ?? 'healthy',
    // `demo=1` identifies the disposable Build Week environment; it must not
    // replace authenticated Hermes telemetry with static fixtures. Deterministic
    // fixtures remain explicitly available to visual/test harnesses through
    // `fixture=1` (and focused scenario URLs).
    demoMode: fixtureMode,
    environmentDemo: params.get('demo') === '1',
  })
}
