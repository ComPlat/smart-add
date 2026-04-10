import { RefObject, useLayoutEffect, useState } from 'react'

export function usePopupPosition(
  ref: RefObject<HTMLElement | null>,
  x: number,
  y: number,
) {
  const [pos, setPos] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const pad = 8
    setPos({
      left: Math.min(x, window.innerWidth - rect.width - pad),
      top: Math.min(y, window.innerHeight - rect.height - pad),
    })
  }, [ref, x, y])

  return pos
}
