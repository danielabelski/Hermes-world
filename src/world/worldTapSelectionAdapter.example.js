import { presentWorldSelection } from './worldTapSelectionAdapter'

// Compile-safe integration example for the future Pixi display-object handler.
// Keep this as a reference module; it has no runtime side effects.
export function examplePixiTapHandler(event) {
  return presentWorldSelection(
    {
      id: 'coder',
      kind: 'agent',
      displayName: 'Kowal',
      visualState: 'working',
    },
    event,
  )
}
