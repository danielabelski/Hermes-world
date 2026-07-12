export function resolveDemoRuntimeMode(search = '', envDemo = false) {
  const params = new URLSearchParams(search)
  const focus = params.get('focus') ?? 'auto'
  return Object.freeze({
    focus,
    scenario: params.get('scenario') ?? 'healthy',
    demoMode: Boolean(envDemo) || params.get('demo') === '1' || focus !== 'auto',
  })
}
