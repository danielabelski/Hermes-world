import { Component } from 'react'

// The DOM living-world layer is the guaranteed baseline. Pixi enriches it
// when WebGL is available, but a renderer import/runtime failure must never
// strand a mobile visitor on the HTML boot screen.
export default class WorldRendererBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.warn('Pixi enhancement unavailable; using the living-world fallback.', error)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
