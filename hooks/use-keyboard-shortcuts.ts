"use client"

import { useEffect } from "react"

interface KeyboardShortcuts {
  onCompare?: () => void
  onClear?: () => void
  onToggleTheme?: () => void
  onPrettify1?: () => void
  onPrettify2?: () => void
}

export function useKeyboardShortcuts({
  onCompare,
  onClear,
  onToggleTheme,
  onPrettify1,
  onPrettify2,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return
      }

      // Ctrl/Cmd + Enter: Compare
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault()
        onCompare?.()
      }

      // Ctrl/Cmd + K: Clear
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        onClear?.()
      }

      // Ctrl/Cmd + T: Toggle theme
      if ((event.ctrlKey || event.metaKey) && event.key === "t") {
        event.preventDefault()
        onToggleTheme?.()
      }

      // Ctrl/Cmd + 1: Prettify JSON 1
      if ((event.ctrlKey || event.metaKey) && event.key === "1") {
        event.preventDefault()
        onPrettify1?.()
      }

      // Ctrl/Cmd + 2: Prettify JSON 2
      if ((event.ctrlKey || event.metaKey) && event.key === "2") {
        event.preventDefault()
        onPrettify2?.()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onCompare, onClear, onToggleTheme, onPrettify1, onPrettify2])
}
