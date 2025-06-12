"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import type { JsonComparisonResult, ComparisonSettings } from "@/types/comparison"

interface JsonState {
  json1: string
  json2: string
  json1Name: string
  json2Name: string
  comparisonResult: JsonComparisonResult | null
  highlightedPath: string | null
  currentDiffIndex: number
  settings: ComparisonSettings
  isComparing: boolean
  errors: {
    json1?: string
    json2?: string
    comparison?: string
  }
  isLoading: {
    json1: boolean
    json2: boolean
    comparison: boolean
  }
}

type JsonAction =
  | { type: "SET_JSON"; payload: { target: 1 | 2; value: string; filename?: string } }
  | { type: "SET_COMPARISON_RESULT"; payload: JsonComparisonResult | null }
  | { type: "SET_HIGHLIGHTED_PATH"; payload: string | null }
  | { type: "SET_CURRENT_DIFF_INDEX"; payload: number }
  | { type: "SET_SETTINGS"; payload: ComparisonSettings }
  | { type: "SET_COMPARING"; payload: boolean }
  | { type: "SET_ERROR"; payload: { target: "json1" | "json2" | "comparison"; error?: string } }
  | { type: "SET_LOADING"; payload: { target: "json1" | "json2" | "comparison"; loading: boolean } }
  | { type: "CLEAR_ALL" }
  | { type: "CLEAR_JSON"; payload: 1 | 2 }

const initialState: JsonState = {
  json1: "",
  json2: "",
  json1Name: "",
  json2Name: "",
  comparisonResult: null,
  highlightedPath: null,
  currentDiffIndex: 0,
  settings: {
    indentation: 2,
    sortKeys: false,
    ignoreOrder: true,
    fuzzyMatch: true,
    ignoreCase: false,
  },
  isComparing: false,
  errors: {},
  isLoading: {
    json1: false,
    json2: false,
    comparison: false,
  },
}

function jsonReducer(state: JsonState, action: JsonAction): JsonState {
  switch (action.type) {
    case "SET_JSON":
      const { target, value, filename } = action.payload
      return {
        ...state,
        [target === 1 ? "json1" : "json2"]: value,
        [target === 1 ? "json1Name" : "json2Name"]: filename || "",
        errors: {
          ...state.errors,
          [target === 1 ? "json1" : "json2"]: undefined,
        },
      }
    case "SET_COMPARISON_RESULT":
      return {
        ...state,
        comparisonResult: action.payload,
        currentDiffIndex: 0,
        highlightedPath: action.payload?.differences[0]?.path || null,
      }
    case "SET_HIGHLIGHTED_PATH":
      return { ...state, highlightedPath: action.payload }
    case "SET_CURRENT_DIFF_INDEX":
      return { ...state, currentDiffIndex: action.payload }
    case "SET_SETTINGS":
      return { ...state, settings: action.payload }
    case "SET_COMPARING":
      return { ...state, isComparing: action.payload }
    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.target]: action.payload.error,
        },
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.target]: action.payload.loading,
        },
      }
    case "CLEAR_ALL":
      return {
        ...initialState,
        settings: state.settings, // Preserve settings
      }
    case "CLEAR_JSON":
      const targetField = action.payload === 1 ? "json1" : "json2"
      const targetNameField = action.payload === 1 ? "json1Name" : "json2Name"
      const targetErrorField = action.payload === 1 ? "json1" : "json2"
      return {
        ...state,
        [targetField]: "",
        [targetNameField]: "",
        comparisonResult: null,
        highlightedPath: null,
        currentDiffIndex: 0,
        errors: {
          ...state.errors,
          [targetErrorField]: undefined,
        },
      }
    default:
      return state
  }
}

interface JsonContextType {
  state: JsonState
  setJson: (target: 1 | 2, value: string, filename?: string) => void
  setComparisonResult: (result: JsonComparisonResult | null) => void
  setHighlightedPath: (path: string | null) => void
  setCurrentDiffIndex: (index: number) => void
  setSettings: (settings: ComparisonSettings) => void
  setComparing: (comparing: boolean) => void
  setError: (target: "json1" | "json2" | "comparison", error?: string) => void
  setLoading: (target: "json1" | "json2" | "comparison", loading: boolean) => void
  clearAll: () => void
  clearJson: (target: 1 | 2) => void
}

const JsonContext = createContext<JsonContextType | undefined>(undefined)

export function JsonProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(jsonReducer, initialState)

  const setJson = useCallback((target: 1 | 2, value: string, filename?: string) => {
    dispatch({ type: "SET_JSON", payload: { target, value, filename } })
  }, [])

  const setComparisonResult = useCallback((result: JsonComparisonResult | null) => {
    dispatch({ type: "SET_COMPARISON_RESULT", payload: result })
  }, [])

  const setHighlightedPath = useCallback((path: string | null) => {
    dispatch({ type: "SET_HIGHLIGHTED_PATH", payload: path })
  }, [])

  const setCurrentDiffIndex = useCallback((index: number) => {
    dispatch({ type: "SET_CURRENT_DIFF_INDEX", payload: index })
  }, [])

  const setSettings = useCallback((settings: ComparisonSettings) => {
    dispatch({ type: "SET_SETTINGS", payload: settings })
  }, [])

  const setComparing = useCallback((comparing: boolean) => {
    dispatch({ type: "SET_COMPARING", payload: comparing })
  }, [])

  const setError = useCallback((target: "json1" | "json2" | "comparison", error?: string) => {
    dispatch({ type: "SET_ERROR", payload: { target, error } })
  }, [])

  const setLoading = useCallback((target: "json1" | "json2" | "comparison", loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: { target, loading } })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" })
  }, [])

  const clearJson = useCallback((target: 1 | 2) => {
    dispatch({ type: "CLEAR_JSON", payload: target })
  }, [])

  const value: JsonContextType = {
    state,
    setJson,
    setComparisonResult,
    setHighlightedPath,
    setCurrentDiffIndex,
    setSettings,
    setComparing,
    setError,
    setLoading,
    clearAll,
    clearJson,
  }

  return <JsonContext.Provider value={value}>{children}</JsonContext.Provider>
}

export function useJsonContext() {
  const context = useContext(JsonContext)
  if (context === undefined) {
    throw new Error("useJsonContext must be used within a JsonProvider")
  }
  return context
}
