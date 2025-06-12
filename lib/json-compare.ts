import type { JsonComparisonResult, JsonDifference } from "@/types/comparison"

export interface ComparisonSettings {
  indentation: number
  sortKeys: boolean
  ignoreOrder: boolean
  fuzzyMatch: boolean
  ignoreCase: boolean
}

export async function compareJsons(
  json1: string,
  json2: string,
  settings: ComparisonSettings,
): Promise<JsonComparisonResult> {
  try {
    const obj1 = JSON.parse(json1)
    const obj2 = JSON.parse(json2)

    const differences: JsonDifference[] = []
    const lineMap1 = createLineMap(json1)
    const lineMap2 = createLineMap(json2)

    // Perform deep comparison
    compareObjects(obj1, obj2, "", differences, settings, lineMap1, lineMap2)

    // Calculate summary with more accurate counts
    const summary = calculateSummary(differences, obj1, obj2)

    return { differences, summary }
  } catch (error) {
    throw new Error("Failed to compare JSONs: " + (error as Error).message)
  }
}

function createLineMap(jsonString: string): Map<string, number> {
  const lines = jsonString.split("\n")
  const lineMap = new Map<string, number>()

  let currentPath = ""
  const pathStack: string[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    const lineNumber = index + 1

    // Extract property names from JSON lines
    const keyMatch = trimmedLine.match(/^"([^"]+)"\s*:/)
    if (keyMatch) {
      const key = keyMatch[1]
      const newPath = pathStack.length > 0 ? `${pathStack.join(".")}.${key}` : key
      lineMap.set(newPath, lineNumber)
      currentPath = newPath
    }

    // Handle object/array opening
    if (trimmedLine.includes("{") || trimmedLine.includes("[")) {
      if (currentPath) {
        pathStack.push(currentPath.split(".").pop() || "")
      }
    }

    // Handle object/array closing
    if (trimmedLine.includes("}") || trimmedLine.includes("]")) {
      pathStack.pop()
    }
  })

  return lineMap
}

function compareObjects(
  obj1: any,
  obj2: any,
  path: string,
  differences: JsonDifference[],
  settings: ComparisonSettings,
  lineMap1: Map<string, number>,
  lineMap2: Map<string, number>,
) {
  // Handle null/undefined cases
  if (obj1 === null && obj2 === null) return
  if (obj1 === undefined && obj2 === undefined) return

  if (obj1 === null || obj1 === undefined) {
    differences.push({
      type: "addition",
      path: path || "root",
      newValue: obj2,
      rightLine: lineMap2.get(path) || 1,
    })
    return
  }

  if (obj2 === null || obj2 === undefined) {
    differences.push({
      type: "deletion",
      path: path || "root",
      oldValue: obj1,
      leftLine: lineMap1.get(path) || 1,
    })
    return
  }

  // Handle primitive values
  if (!isObject(obj1) || !isObject(obj2)) {
    if (!deepEqual(obj1, obj2, settings)) {
      differences.push({
        type: "modification",
        path: path || "root",
        oldValue: obj1,
        newValue: obj2,
        leftLine: lineMap1.get(path) || 1,
        rightLine: lineMap2.get(path) || 1,
      })
    }
    return
  }

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    compareArrays(obj1, obj2, path, differences, settings, lineMap1, lineMap2)
    return
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    differences.push({
      type: "modification",
      path: path || "root",
      oldValue: obj1,
      newValue: obj2,
      leftLine: lineMap1.get(path) || 1,
      rightLine: lineMap2.get(path) || 1,
    })
    return
  }

  // Handle objects
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  const allKeys = new Set([...keys1, ...keys2])

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key
    const val1 = obj1[key]
    const val2 = obj2[key]

    if (!(key in obj1)) {
      differences.push({
        type: "addition",
        path: currentPath,
        newValue: val2,
        rightLine: lineMap2.get(currentPath) || 1,
      })
    } else if (!(key in obj2)) {
      differences.push({
        type: "deletion",
        path: currentPath,
        oldValue: val1,
        leftLine: lineMap1.get(currentPath) || 1,
      })
    } else {
      compareObjects(val1, val2, currentPath, differences, settings, lineMap1, lineMap2)
    }
  }
}

function compareArrays(
  arr1: any[],
  arr2: any[],
  path: string,
  differences: JsonDifference[],
  settings: ComparisonSettings,
  lineMap1: Map<string, number>,
  lineMap2: Map<string, number>,
) {
  if (settings.ignoreOrder) {
    // Compare arrays by content, not order
    const used2 = new Set<number>()

    for (let i = 0; i < arr1.length; i++) {
      const currentPath = `${path}[${i}]`
      let found = false

      for (let j = 0; j < arr2.length; j++) {
        if (used2.has(j)) continue

        if (deepEqual(arr1[i], arr2[j], settings)) {
          used2.add(j)
          found = true
          break
        }
      }

      if (!found) {
        differences.push({
          type: "deletion",
          path: currentPath,
          oldValue: arr1[i],
          leftLine: lineMap1.get(currentPath) || 1,
        })
      }
    }

    for (let j = 0; j < arr2.length; j++) {
      if (!used2.has(j)) {
        const currentPath = `${path}[${j}]`
        differences.push({
          type: "addition",
          path: currentPath,
          newValue: arr2[j],
          rightLine: lineMap2.get(currentPath) || 1,
        })
      }
    }
  } else {
    // Compare arrays by index
    const maxLength = Math.max(arr1.length, arr2.length)

    for (let i = 0; i < maxLength; i++) {
      const currentPath = `${path}[${i}]`

      if (i >= arr1.length) {
        differences.push({
          type: "addition",
          path: currentPath,
          newValue: arr2[i],
          rightLine: lineMap2.get(currentPath) || 1,
        })
      } else if (i >= arr2.length) {
        differences.push({
          type: "deletion",
          path: currentPath,
          oldValue: arr1[i],
          leftLine: lineMap1.get(currentPath) || 1,
        })
      } else {
        compareObjects(arr1[i], arr2[i], currentPath, differences, settings, lineMap1, lineMap2)
      }
    }
  }
}

function calculateSummary(differences: JsonDifference[], obj1: any, obj2: any) {
  const additions = differences.filter((d) => d.type === "addition").length
  const deletions = differences.filter((d) => d.type === "deletion").length
  const modifications = differences.filter((d) => d.type === "modification").length

  // Calculate unchanged properties more accurately
  const totalProps1 = countProperties(obj1)
  const totalProps2 = countProperties(obj2)
  const totalChanges = additions + deletions + modifications
  const unchanged = Math.max(0, Math.min(totalProps1, totalProps2) - totalChanges)

  return {
    additions,
    deletions,
    modifications,
    unchanged,
  }
}

function countProperties(obj: any): number {
  if (!isObject(obj)) return 1

  if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countProperties(item), 0)
  }

  return Object.keys(obj).reduce((count, key) => {
    return count + 1 + countProperties(obj[key])
  }, 0)
}

function isObject(value: any): boolean {
  return value !== null && typeof value === "object"
}

function deepEqual(val1: any, val2: any, settings: ComparisonSettings): boolean {
  if (val1 === val2) return true

  // Handle null/undefined
  if (val1 == null || val2 == null) return val1 === val2

  // Handle string comparison with settings
  if (typeof val1 === "string" && typeof val2 === "string") {
    let str1 = val1
    let str2 = val2

    if (settings.ignoreCase) {
      str1 = str1.toLowerCase()
      str2 = str2.toLowerCase()
    }

    if (settings.fuzzyMatch) {
      return fuzzyMatch(str1, str2)
    }

    return str1 === str2
  }

  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false

    if (settings.ignoreOrder) {
      return (
        val1.every((item1) => val2.some((item2) => deepEqual(item1, item2, settings))) &&
        val2.every((item2) => val1.some((item1) => deepEqual(item1, item2, settings)))
      )
    }

    return val1.every((item, index) => deepEqual(item, val2[index], settings))
  }

  // Handle objects
  if (isObject(val1) && isObject(val2)) {
    const keys1 = Object.keys(val1)
    const keys2 = Object.keys(val2)

    if (keys1.length !== keys2.length) return false

    return keys1.every((key) => key in val2 && deepEqual(val1[key], val2[key], settings))
  }

  return false
}

function fuzzyMatch(str1: string, str2: string): boolean {
  // Normalize strings for fuzzy matching
  const normalize = (str: string) =>
    str
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .toLowerCase()

  const normalized1 = normalize(str1)
  const normalized2 = normalize(str2)

  // Exact match after normalization
  if (normalized1 === normalized2) return true

  // Levenshtein distance for similarity
  const distance = levenshteinDistance(normalized1, normalized2)
  const maxLength = Math.max(normalized1.length, normalized2.length)
  const similarity = 1 - distance / maxLength

  // Consider strings similar if they're 80% similar
  return similarity >= 0.8
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}
