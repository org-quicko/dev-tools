export interface ComparisonSettings {
  indentation: number
  sortKeys: boolean
  ignoreOrder: boolean
  fuzzyMatch: boolean
  ignoreCase: boolean
}

export interface JsonDifference {
  type: "addition" | "deletion" | "modification"
  path: string
  leftLine?: number
  rightLine?: number
  oldValue?: any
  newValue?: any
}

export interface JsonComparisonResult {
  differences: JsonDifference[]
  summary: {
    additions: number
    deletions: number
    modifications: number
    unchanged: number
  }
}
