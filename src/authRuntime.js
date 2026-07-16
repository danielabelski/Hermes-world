export function resolveAuthenticationState(responseOk, status) {
  if (!responseOk) return 'unauthenticated'
  if (status?.auth_enabled === false) return 'authenticated'
  return status?.logged_in === true ? 'authenticated' : 'unauthenticated'
}
