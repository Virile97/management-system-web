"use client"

import { useCallback, useEffect, useRef } from "react"

const CLICK_DELAY_MS = 220

function useGridItemInteraction({ onSelect, onOpen }) {
  const timerRef = useRef(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const handleClick = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSelect?.()
      timerRef.current = null
    }, CLICK_DELAY_MS)
  }, [onSelect])

  const handleDoubleClick = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onOpen?.()
  }, [onOpen])

  return { handleClick, handleDoubleClick }
}

export { useGridItemInteraction }
