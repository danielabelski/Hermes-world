import { memo } from 'react'

function EnvironmentalDebugPanel({ presentation }) {
  return <aside className="environment-debug-panel" aria-label="Environmental Director debug">
    <strong>Environmental Director: {presentation.running ? 'running' : 'stopped'}</strong>
    <span>buildings: {presentation.activeBuildingIds.join(', ') || 'none'}</span>
    <span>data pulses: {presentation.ambientPulses.length + (presentation.responsePulse ? 1 : 0)}</span>
    <span>particles: {presentation.particleCount}</span>
    <span>operations: {presentation.worldOperations?.operations?.map((item) => item.type).join(', ') || 'none'}</span>
    <span>major processes: {presentation.worldOperations?.majorCount ?? 0}</span>
    <span>event: {presentation.response ? `${presentation.response.buildingId}/${presentation.response.cue}` : 'none'}</span>
    <span>performance: {presentation.performanceStatus}</span>
    <span>tab: {presentation.visible ? 'visible' : 'hidden'}</span>
    <span>reduced motion: {presentation.reducedMotion ? 'yes' : 'no'}</span>
  </aside>
}

export default memo(EnvironmentalDebugPanel)
