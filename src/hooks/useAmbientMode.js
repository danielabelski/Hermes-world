import { useEffect, useRef, useState } from 'react'

export function useAmbientMode({ disabled = false, delayMs = 6_000 } = {}) {
  const [ambient, setAmbient] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const clear = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const arm = () => {
      clear()
      setAmbient(false)
      if (!disabled) timerRef.current = window.setTimeout(() => setAmbient(true), delayMs)
    }
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown']
    events.forEach((event) => window.addEventListener(event, arm, { passive: true }))
    arm()
    return () => {
      clear()
      events.forEach((event) => window.removeEventListener(event, arm))
    }
  }, [delayMs, disabled])

  return ambient && !disabled
}
