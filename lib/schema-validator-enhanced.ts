import * as yaml from "js-yaml"

export type SchemaDraft = "draft-03" | "draft-04" | "draft-06" | "draft-07" | "2019-09" | "2020-12" | "auto"

export interface ValidationError {
  instancePath: string
  schemaPath: string
  keyword: string
  params: any
  message: string
  lineNumber?: number
  columnNumber?: number
  severity: "error" | "warning"
  category: "required" | "type" | "format" | "pattern" | "enum" | "constraint" | "reference" | "custom"
  suggestion?: string
  affectedValue?: any
  expectedValue?: any
  schemaLocation?: string
  dataLocation?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  summary: {
    totalErrors: number
    totalWarnings: number
    errorsByCategory: Record<string, number>
    validationTime: number
    schemaComplexity: number
    dataSize: number
    totalProperties: number
    requiredProperties: number
    validatedProperties: number
  }
  detectedDraft?: SchemaDraft
  schemaInfo?: {
    title?: string
    description?: string
    version?: string
    properties: number
    requiredFields: number
    hasExternalRefs: boolean
  }
}

export interface ValidatorOptions {
  draft?: SchemaDraft
  strict?: boolean
  allErrors?: boolean
  verbose?: boolean
  removeAdditional?: boolean | "all" | "failing"
  useDefaults?: boolean
  coerceTypes?: boolean | "array"
  allowUnionTypes?: boolean
  allowMatchingProperties?: boolean
  validateFormats?: boolean
  resolveExternalRefs?: boolean
  maxDepth?: number
  timeout?: number
  customFormats?: Record<string, any>
  customKeywords?: Record<string, any>
}

export interface BatchValidationResult {
  fileName: string
  result: ValidationResult
  processingTime: number
}

export interface SchemaVisualization {
  type: string
  properties?: Record<string, SchemaVisualization>
  items?: SchemaVisualization
  required?: string[]
  description?: string
  format?: string
  enum?: any[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  additionalProperties?: boolean | SchemaVisualization
  examples?: any[]
  default?: any
  title?: string
  $ref?: string
}

export class EnhancedJsonSchemaValidator {
  private jsonLines: string[] = []
  private schemaLines: string[] = []
  private options: ValidatorOptions
  private schema: any = null
  private definitions: Record<string, any> = {}
  private validatedProperties: Set<string> = new Set()
  private requiredProperties: Set<string> = new Set()
  private totalProperties: Set<string> = new Set()
  private externalSchemas: Map<string, any> = new Map()

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      draft: "auto",
      strict: false,
      allErrors: true,
      verbose: true,
      validateFormats: true,
      resolveExternalRefs: false,
      timeout: 5000,
      ...options,
    }
  }

  public detectSchemaDraft(schema: any): SchemaDraft {
    if (typeof schema !== "object" || !schema) {
      return "draft-07" // Default fallback
    }

    const schemaUrl = schema.$schema
    if (!schemaUrl) {
      return "auto"
    }

    if (schemaUrl.includes("draft-03")) return "draft-03"
    if (schemaUrl.includes("draft-04")) return "draft-04"
    if (schemaUrl.includes("draft-06")) return "draft-06"
    if (schemaUrl.includes("draft-07")) return "draft-07"
    if (schemaUrl.includes("2019-09")) return "2019-09"
    if (schemaUrl.includes("2020-12")) return "2020-12"

    return "draft-07" // Default fallback
  }

  public parseInput(input: string, format: "json" | "yaml" | "auto" = "auto"): any {
    const trimmedInput = input.trim()

    if (format === "auto") {
      // Try to detect format
      if (trimmedInput.startsWith("{") || trimmedInput.startsWith("[")) {
        format = "json"
      } else {
        format = "yaml"
      }
    }

    try {
      if (format === "yaml") {
        return yaml.load(trimmedInput)
      } else {
        return JSON.parse(trimmedInput)
      }
    } catch (error) {
      // If YAML parsing fails, try JSON
      if (format === "yaml") {
        try {
          return JSON.parse(trimmedInput)
        } catch {
          throw new Error(`Failed to parse as both YAML and JSON: ${(error as Error).message}`)
        }
      }
      throw error
    }
  }

  public async validate(
    jsonData: string,
    schemaData: string,
    options: ValidatorOptions = {},
  ): Promise<ValidationResult> {
    const startTime = performance.now()
    const mergedOptions = { ...this.options, ...options }

    try {
      // Reset tracking sets
      this.validatedProperties = new Set()
      this.requiredProperties = new Set()
      this.totalProperties = new Set()
      this.externalSchemas = new Map()

      // Store lines for error reporting
      this.jsonLines = jsonData.split("\n")
      this.schemaLines = schemaData.split("\n")

      // Parse inputs with format detection
      let parsedJson: any
      let parsedSchema: any

      try {
        parsedJson = this.parseInput(jsonData)
      } catch (error) {
        return this.createParseErrorResult("JSON data", error as Error, startTime)
      }

      try {
        parsedSchema = this.parseInput(schemaData)
      } catch (error) {
        return this.createParseErrorResult("JSON schema", error as Error, startTime)
      }

      // Store the schema for reference resolution
      this.schema = parsedSchema

      // Extract definitions for easier reference resolution
      if (parsedSchema.definitions) {
        this.definitions = parsedSchema.definitions
      }

      // Detect or use specified draft
      const detectedDraft =
        mergedOptions.draft === "auto" || !mergedOptions.draft
          ? this.detectSchemaDraft(parsedSchema)
          : mergedOptions.draft

      const actualDraft = detectedDraft === "auto" ? "draft-07" : detectedDraft

      // Validate using custom validator
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = []

      try {
        // Collect all properties and required properties
        this.collectSchemaProperties(parsedSchema, "")

        // Perform validation
        this.validateRecursive(parsedJson, parsedSchema, "", "", errors, warnings, mergedOptions)

        // Check for missing required properties
        this.checkMissingRequiredProperties(parsedJson, parsedSchema, "", errors, mergedOptions)
      } catch (error) {
        return this.createValidationErrorResult(error as Error, startTime)
      }

      const isValid = errors.length === 0

      // Calculate metrics
      const endTime = performance.now()
      const validationTime = endTime - startTime
      const schemaComplexity = this.calculateSchemaComplexity(parsedSchema)
      const dataSize = JSON.stringify(parsedJson).length

      // Generate schema info
      const schemaInfo = this.generateSchemaInfo(parsedSchema)

      // Create summary
      const errorsByCategory = this.categorizeErrors([...errors, ...warnings])

      return {
        isValid,
        errors,
        warnings,
        summary: {
          totalErrors: errors.length,
          totalWarnings: warnings.length,
          errorsByCategory,
          validationTime,
          schemaComplexity,
          dataSize,
          totalProperties: this.totalProperties.size,
          requiredProperties: this.requiredProperties.size,
          validatedProperties: this.validatedProperties.size,
        },
        detectedDraft: detectedDraft,
        schemaInfo,
      }
    } catch (error) {
      return this.createUnexpectedErrorResult(error as Error, startTime)
    }
  }

  private collectSchemaProperties(schema: any, path: string): void {
    if (!schema || typeof schema !== "object") {
      return
    }

    // Handle $ref
    if (schema.$ref) {
      const resolvedSchema = this.resolveReference(schema.$ref)
      if (resolvedSchema) {
        this.collectSchemaProperties(resolvedSchema, path)
      }
      return
    }

    // Collect properties
    if (schema.properties) {
      Object.keys(schema.properties).forEach((propName) => {
        const propPath = path ? `${path}.${propName}` : propName
        this.totalProperties.add(propPath)

        // Collect nested properties
        this.collectSchemaProperties(schema.properties[propName], propPath)
      })
    }

    // Collect required properties
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((propName: string) => {
        const propPath = path ? `${path}.${propName}` : propName
        this.requiredProperties.add(propPath)
      })
    }

    // Handle array items
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item: any, index: number) => {
          this.collectSchemaProperties(item, `${path}[${index}]`)
        })
      } else {
        this.collectSchemaProperties(schema.items, `${path}[]`)
      }
    }
    // Handle allOf, anyOf, oneOf
    ;["allOf", "anyOf", "oneOf"].forEach((keyword) => {
      if (schema[keyword] && Array.isArray(schema[keyword])) {
        schema[keyword].forEach((subSchema: any, index: number) => {
          this.collectSchemaProperties(subSchema, `${path}${keyword}[${index}]`)
        })
      }
    })
  }

  private resolveReference(ref: string): any {
    // Handle external references
    if (ref.startsWith("http://") || ref.startsWith("https://")) {
      if (this.externalSchemas.has(ref)) {
        return this.externalSchemas.get(ref)
      }

      // External references not supported in this implementation
      // unless they've been pre-loaded
      return null
    }

    // Handle local references
    if (ref.startsWith("#/")) {
      const path = ref.substring(2).split("/")
      let current = this.schema

      for (const segment of path) {
        if (current[segment] === undefined) {
          return null
        }
        current = current[segment]
      }

      return current
    }

    return null
  }

  private checkMissingRequiredProperties(
    data: any,
    schema: any,
    dataPath: string,
    errors: ValidationError[],
    options: ValidatorOptions,
  ): void {
    if (!schema || typeof schema !== "object" || !data || typeof data !== "object" || Array.isArray(data)) {
      return
    }

    // Handle $ref
    if (schema.$ref) {
      const resolvedSchema = this.resolveReference(schema.$ref)
      if (resolvedSchema) {
        this.checkMissingRequiredProperties(data, resolvedSchema, dataPath, errors, options)
      }
      return
    }

    // Check required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in data)) {
          const propPath = dataPath ? `${dataPath}.${requiredProp}` : requiredProp
          errors.push(
            this.createError("required", propPath, `${dataPath}#/required`, {
              message: `Required property '${requiredProp}' is missing at ${dataPath || "root"}`,
              category: "required",
              params: { missingProperty: requiredProp },
              suggestion: `Add the required field '${requiredProp}' to your JSON data`,
            }),
          )
        }
      }
    }

    // Check nested objects in properties
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in data) {
          const propPath = dataPath ? `${dataPath}.${propName}` : propName
          this.checkMissingRequiredProperties(data[propName], propSchema, propPath, errors, options)
        }
      }
    }

    // Check items in arrays
    if (schema.items && Array.isArray(data)) {
      if (Array.isArray(schema.items)) {
        // Tuple validation
        for (let i = 0; i < Math.min(data.length, schema.items.length); i++) {
          const itemPath = dataPath ? `${dataPath}[${i}]` : `[${i}]`
          this.checkMissingRequiredProperties(data[i], schema.items[i], itemPath, errors, options)
        }
      } else {
        // Array validation
        for (let i = 0; i < data.length; i++) {
          const itemPath = dataPath ? `${dataPath}[${i}]` : `[${i}]`
          this.checkMissingRequiredProperties(data[i], schema.items, itemPath, errors, options)
        }
      }
    }
    // Handle allOf, anyOf, oneOf
    ;["allOf", "anyOf", "oneOf"].forEach((keyword) => {
      if (schema[keyword] && Array.isArray(schema[keyword])) {
        if (keyword === "allOf") {
          // For allOf, all schemas must be satisfied
          schema[keyword].forEach((subSchema: any) => {
            this.checkMissingRequiredProperties(data, subSchema, dataPath, errors, options)
          })
        }
        // For anyOf and oneOf, we don't check missing required properties here
        // as they're handled during validation
      }
    })
  }

  private validateRecursive(
    data: any,
    schema: any,
    dataPath: string,
    schemaPath: string,
    errors: ValidationError[],
    warnings: ValidationError[],
    options: ValidatorOptions,
    depth = 0,
  ): void {
    // Prevent infinite recursion
    if (depth > 100) {
      warnings.push(
        this.createError("maxDepth", dataPath, schemaPath, {
          message: "Maximum recursion depth exceeded",
          category: "custom",
          severity: "warning",
          suggestion: "Your schema might have circular references",
        }),
      )
      return
    }

    if (!schema || typeof schema !== "object") {
      return
    }

    // Handle $ref
    if (schema.$ref) {
      const resolvedSchema = this.resolveReference(schema.$ref)
      if (resolvedSchema) {
        this.validateRecursive(
          data,
          resolvedSchema,
          dataPath,
          `${schemaPath}->$ref:${schema.$ref}`,
          errors,
          warnings,
          options,
          depth + 1,
        )
      } else {
        errors.push(
          this.createError("$ref", dataPath, schemaPath, {
            message: `Could not resolve reference: ${schema.$ref}`,
            category: "reference",
            params: { ref: schema.$ref },
            suggestion: "Check that the reference is correct and points to a valid schema definition",
          }),
        )
      }
      return
    }

    // Type validation
    if (schema.type) {
      const actualType = this.getJsonType(data)
      const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type]

      if (!expectedTypes.includes(actualType)) {
        errors.push(
          this.createError("type", dataPath, schemaPath, {
            message: `Expected type ${expectedTypes.join(" or ")} but got ${actualType} at ${dataPath || "root"}`,
            category: "type",
            params: { type: expectedTypes.join(" or "), data },
            suggestion: `Change the value to type '${expectedTypes[0]}' or update the schema to allow '${actualType}'`,
            affectedValue: data,
            expectedValue: `type: ${expectedTypes.join(" or ")}`,
          }),
        )
        return
      }
    }

    // Required properties validation
    if (
      schema.required &&
      Array.isArray(schema.required) &&
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data)
    ) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in data)) {
          errors.push(
            this.createError("required", `${dataPath}${dataPath ? "." : ""}${requiredProp}`, `${schemaPath}/required`, {
              message: `Required property '${requiredProp}' is missing at ${dataPath || "root"}`,
              category: "required",
              params: { missingProperty: requiredProp },
              suggestion: `Add the required field '${requiredProp}' to your JSON data`,
            }),
          )
        }
      }
    }

    // Properties validation
    if (schema.properties && typeof data === "object" && data !== null && !Array.isArray(data)) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propPath = dataPath ? `${dataPath}.${propName}` : propName
        const propSchemaPath = `${schemaPath}/properties/${propName}`

        if (propName in data) {
          this.validatedProperties.add(propPath)
          this.validateRecursive(
            data[propName],
            propSchema,
            propPath,
            propSchemaPath,
            errors,
            warnings,
            options,
            depth + 1,
          )
        }
      }

      // Additional properties validation
      if (schema.additionalProperties === false) {
        const allowedProps = new Set(Object.keys(schema.properties))
        for (const propName of Object.keys(data)) {
          if (!allowedProps.has(propName)) {
            const propPath = dataPath ? `${dataPath}.${propName}` : propName
            const error = this.createError("additionalProperties", propPath, schemaPath, {
              message: `Additional property '${propName}' is not allowed at ${dataPath || "root"}`,
              category: "reference",
              params: { additionalProperty: propName },
              suggestion: `Remove the '${propName}' property or update the schema to allow additional properties`,
              severity: "warning" as const,
            })
            warnings.push(error)
          }
        }
      } else if (typeof schema.additionalProperties === "object") {
        const allowedProps = new Set(Object.keys(schema.properties))
        for (const propName of Object.keys(data)) {
          if (!allowedProps.has(propName)) {
            const propPath = dataPath ? `${dataPath}.${propName}` : propName
            const propSchemaPath = `${schemaPath}/additionalProperties`
            this.validateRecursive(
              data[propName],
              schema.additionalProperties,
              propPath,
              propSchemaPath,
              errors,
              warnings,
              options,
              depth + 1,
            )
          }
        }
      }
    }

    // Pattern properties validation
    if (schema.patternProperties && typeof data === "object" && data !== null && !Array.isArray(data)) {
      for (const [pattern, patternSchema] of Object.entries(schema.patternProperties)) {
        try {
          const regex = new RegExp(pattern)
          for (const propName of Object.keys(data)) {
            if (regex.test(propName)) {
              const propPath = dataPath ? `${dataPath}.${propName}` : propName
              const propSchemaPath = `${schemaPath}/patternProperties/${pattern}`
              this.validateRecursive(
                data[propName],
                patternSchema,
                propPath,
                propSchemaPath,
                errors,
                warnings,
                options,
                depth + 1,
              )
            }
          }
        } catch (e) {
          warnings.push(
            this.createError("patternProperties", dataPath, schemaPath, {
              message: `Invalid regex pattern in schema: ${pattern}`,
              category: "custom",
              params: { pattern },
              suggestion: "Fix the regex pattern in the schema",
              severity: "warning" as const,
            }),
          )
        }
      }
    }

    // Array validation
    if (schema.type === "array" && Array.isArray(data)) {
      // Items validation
      if (schema.items) {
        if (Array.isArray(schema.items)) {
          // Tuple validation
          const minItems = Math.min(data.length, schema.items.length)
          for (let i = 0; i < minItems; i++) {
            const itemPath = dataPath ? `${dataPath}[${i}]` : `[${i}]`
            const itemSchemaPath = `${schemaPath}/items[${i}]`
            this.validateRecursive(
              data[i],
              schema.items[i],
              itemPath,
              itemSchemaPath,
              errors,
              warnings,
              options,
              depth + 1,
            )
          }

          // Additional items validation
          if (schema.additionalItems === false && data.length > schema.items.length) {
            errors.push(
              this.createError("additionalItems", dataPath, schemaPath, {
                message: `Array at '${dataPath || "root"}' has more items than allowed`,
                category: "constraint",
                params: { limit: schema.items.length },
                suggestion: `Remove additional items to match the schema definition`,
              }),
            )
          } else if (typeof schema.additionalItems === "object" && data.length > schema.items.length) {
            for (let i = schema.items.length; i < data.length; i++) {
              const itemPath = dataPath ? `${dataPath}[${i}]` : `[${i}]`
              const itemSchemaPath = `${schemaPath}/additionalItems`
              this.validateRecursive(
                data[i],
                schema.additionalItems,
                itemPath,
                itemSchemaPath,
                errors,
                warnings,
                options,
                depth + 1,
              )
            }
          }
        } else {
          // Array validation (all items must match the same schema)
          for (let i = 0; i < data.length; i++) {
            const itemPath = dataPath ? `${dataPath}[${i}]` : `[${i}]`
            const itemSchemaPath = `${schemaPath}/items`
            this.validateRecursive(
              data[i],
              schema.items,
              itemPath,
              itemSchemaPath,
              errors,
              warnings,
              options,
              depth + 1,
            )
          }
        }
      }

      // Array constraints
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push(
          this.createError("minItems", dataPath, schemaPath, {
            message: `Array at '${dataPath || "root"}' must have at least ${schema.minItems} items but has ${data.length}`,
            category: "constraint",
            params: { limit: schema.minItems, data: data.length },
            suggestion: `Add more items to reach the minimum of ${schema.minItems}`,
          }),
        )
      }

      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        errors.push(
          this.createError("maxItems", dataPath, schemaPath, {
            message: `Array at '${dataPath || "root"}' must have at most ${schema.maxItems} items but has ${data.length}`,
            category: "constraint",
            params: { limit: schema.maxItems, data: data.length },
            suggestion: `Remove items to stay within the maximum of ${schema.maxItems}`,
          }),
        )
      }

      if (schema.uniqueItems && !this.hasUniqueItems(data)) {
        errors.push(
          this.createError("uniqueItems", dataPath, schemaPath, {
            message: `Array at '${dataPath || "root"}' must have unique items`,
            category: "constraint",
            params: {},
            suggestion: "Remove duplicate items from the array",
          }),
        )
      }
    }

    // String validation
    if (schema.type === "string" && typeof data === "string") {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push(
          this.createError("minLength", dataPath, schemaPath, {
            message: `String at '${dataPath || "root"}' must be at least ${schema.minLength} characters long but is ${data.length}`,
            category: "constraint",
            params: { limit: schema.minLength, data: data.length },
            suggestion: `Add more characters to reach the minimum length of ${schema.minLength}`,
          }),
        )
      }

      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push(
          this.createError("maxLength", dataPath, schemaPath, {
            message: `String at '${dataPath || "root"}' must be at most ${schema.maxLength} characters long but is ${data.length}`,
            category: "constraint",
            params: { limit: schema.maxLength, data: data.length },
            suggestion: `Remove characters to stay within the maximum length of ${schema.maxLength}`,
          }),
        )
      }

      if (schema.pattern) {
        try {
          const regex = new RegExp(schema.pattern)
          if (!regex.test(data)) {
            errors.push(
              this.createError("pattern", dataPath, schemaPath, {
                message: `String at '${dataPath || "root"}' does not match the required pattern: ${schema.pattern}`,
                category: "pattern",
                params: { pattern: schema.pattern },
                suggestion: "Ensure the value matches the specified regular expression pattern",
              }),
            )
          }
        } catch (e) {
          warnings.push(
            this.createError("pattern", dataPath, schemaPath, {
              message: `Invalid regex pattern in schema: ${schema.pattern}`,
              category: "custom",
              params: { pattern: schema.pattern },
              suggestion: "Fix the regex pattern in the schema",
              severity: "warning" as const,
            }),
          )
        }
      }

      // Format validation
      if (schema.format && options.validateFormats) {
        const formatError = this.validateFormat(data, schema.format, dataPath, schemaPath)
        if (formatError) {
          errors.push(formatError)
        }
      }
    }

    // Number validation
    if ((schema.type === "number" || schema.type === "integer") && typeof data === "number") {
      if (schema.minimum !== undefined) {
        if (
          (schema.exclusiveMinimum === true && data <= schema.minimum) ||
          (schema.exclusiveMinimum !== true && data < schema.minimum)
        ) {
          errors.push(
            this.createError("minimum", dataPath, schemaPath, {
              message: `Value at '${dataPath || "root"}' must be ${schema.exclusiveMinimum ? ">" : ">="} ${schema.minimum} but is ${data}`,
              category: "constraint",
              params: { limit: schema.minimum, data, exclusive: schema.exclusiveMinimum === true },
              suggestion: `Increase the value to be ${schema.exclusiveMinimum ? "greater than" : "at least"} ${schema.minimum}`,
            }),
          )
        }
      }

      if (schema.maximum !== undefined) {
        if (
          (schema.exclusiveMaximum === true && data >= schema.maximum) ||
          (schema.exclusiveMaximum !== true && data > schema.maximum)
        ) {
          errors.push(
            this.createError("maximum", dataPath, schemaPath, {
              message: `Value at '${dataPath || "root"}' must be ${schema.exclusiveMaximum ? "<" : "<="} ${schema.maximum} but is ${data}`,
              category: "constraint",
              params: { limit: schema.maximum, data, exclusive: schema.exclusiveMaximum === true },
              suggestion: `Decrease the value to be ${schema.exclusiveMaximum ? "less than" : "at most"} ${schema.maximum}`,
            }),
          )
        }
      }

      if (schema.multipleOf !== undefined && !this.isMultipleOf(data, schema.multipleOf)) {
        errors.push(
          this.createError("multipleOf", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' must be a multiple of ${schema.multipleOf}`,
            category: "constraint",
            params: { multipleOf: schema.multipleOf, data },
            suggestion: `Adjust the value to be a multiple of ${schema.multipleOf}`,
          }),
        )
      }

      if (schema.type === "integer" && !Number.isInteger(data)) {
        errors.push(
          this.createError("type", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' must be an integer but is ${data}`,
            category: "type",
            params: { type: "integer", data },
            suggestion: "Use a whole number without decimal places",
          }),
        )
      }
    }

    // Enum validation
    if (schema.enum && Array.isArray(schema.enum)) {
      const isValid = schema.enum.some((enumValue: any) => this.deepEqual(data, enumValue))
      if (!isValid) {
        errors.push(
          this.createError("enum", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' must be one of: ${schema.enum.map((v: any) => JSON.stringify(v)).join(", ")}`,
            category: "enum",
            params: { allowedValues: schema.enum },
            suggestion: `Use one of these values: ${schema.enum.map((v: any) => JSON.stringify(v)).join(", ")}`,
            expectedValue: schema.enum,
          }),
        )
      }
    }

    // Const validation
    if (schema.const !== undefined) {
      if (!this.deepEqual(data, schema.const)) {
        errors.push(
          this.createError("const", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' must be exactly: ${JSON.stringify(schema.const)}`,
            category: "enum",
            params: { allowedValue: schema.const },
            suggestion: `Use the exact value: ${JSON.stringify(schema.const)}`,
            expectedValue: schema.const,
          }),
        )
      }
    }

    // allOf validation
    if (schema.allOf && Array.isArray(schema.allOf)) {
      for (let i = 0; i < schema.allOf.length; i++) {
        this.validateRecursive(
          data,
          schema.allOf[i],
          dataPath,
          `${schemaPath}/allOf[${i}]`,
          errors,
          warnings,
          options,
          depth + 1,
        )
      }
    }

    // anyOf validation
    if (schema.anyOf && Array.isArray(schema.anyOf)) {
      const anyOfErrors: ValidationError[][] = []
      let valid = false

      for (let i = 0; i < schema.anyOf.length; i++) {
        const subErrors: ValidationError[] = []
        const subWarnings: ValidationError[] = []

        this.validateRecursive(
          data,
          schema.anyOf[i],
          dataPath,
          `${schemaPath}/anyOf[${i}]`,
          subErrors,
          subWarnings,
          options,
          depth + 1,
        )

        if (subErrors.length === 0) {
          valid = true
          break
        }

        anyOfErrors.push(subErrors)
      }

      if (!valid) {
        errors.push(
          this.createError("anyOf", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' does not match any of the required schemas`,
            category: "custom",
            params: { schemas: schema.anyOf.length },
            suggestion: "Ensure the value matches at least one of the required schemas",
          }),
        )
      }
    }

    // oneOf validation
    if (schema.oneOf && Array.isArray(schema.oneOf)) {
      let validCount = 0
      const oneOfErrors: ValidationError[][] = []

      for (let i = 0; i < schema.oneOf.length; i++) {
        const subErrors: ValidationError[] = []
        const subWarnings: ValidationError[] = []

        this.validateRecursive(
          data,
          schema.oneOf[i],
          dataPath,
          `${schemaPath}/oneOf[${i}]`,
          subErrors,
          subWarnings,
          options,
          depth + 1,
        )

        if (subErrors.length === 0) {
          validCount++
        }

        oneOfErrors.push(subErrors)
      }

      if (validCount !== 1) {
        errors.push(
          this.createError("oneOf", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' must match exactly one schema but matched ${validCount}`,
            category: "custom",
            params: { matched: validCount, required: 1 },
            suggestion: "Ensure the value matches exactly one of the required schemas",
          }),
        )
      }
    }

    // not validation
    if (schema.not) {
      const notErrors: ValidationError[] = []
      const notWarnings: ValidationError[] = []

      this.validateRecursive(
        data,
        schema.not,
        dataPath,
        `${schemaPath}/not`,
        notErrors,
        notWarnings,
        options,
        depth + 1,
      )

      if (notErrors.length === 0) {
        errors.push(
          this.createError("not", dataPath, schemaPath, {
            message: `Value at '${dataPath || "root"}' must not match the schema`,
            category: "custom",
            params: {},
            suggestion: "Ensure the value does not match the forbidden schema",
          }),
        )
      }
    }

    // dependencies validation (draft-04 style)
    if (schema.dependencies && typeof data === "object" && data !== null && !Array.isArray(data)) {
      for (const [prop, dependency] of Object.entries(schema.dependencies)) {
        if (prop in data) {
          if (Array.isArray(dependency)) {
            // Property dependencies
            for (const depProp of dependency) {
              if (!(depProp in data)) {
                errors.push(
                  this.createError("dependencies", dataPath, schemaPath, {
                    message: `Property '${prop}' at '${dataPath || "root"}' requires property '${depProp}' to be present`,
                    category: "required",
                    params: { property: prop, dependency: depProp },
                    suggestion: `Add the required property '${depProp}' when '${prop}' is present`,
                  }),
                )
              }
            }
          } else if (typeof dependency === "object") {
            // Schema dependencies
            this.validateRecursive(
              data,
              dependency,
              dataPath,
              `${schemaPath}/dependencies/${prop}`,
              errors,
              warnings,
              options,
              depth + 1,
            )
          }
        }
      }
    }
  }

  private isMultipleOf(value: number, multipleOf: number): boolean {
    const result = value / multipleOf
    const remainder = result - Math.floor(result)

    // Handle floating point precision issues
    return remainder < 1e-10 || remainder > 0.9999999999
  }

  private validateFormat(value: string, format: string, dataPath: string, schemaPath: string): ValidationError | null {
    const formatValidators: Record<string, { regex?: RegExp; validator?: (value: string) => boolean }> = {
      email: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      date: {
        regex: /^\d{4}-\d{2}-\d{2}$/,
        validator: (v) => !isNaN(Date.parse(v)),
      },
      "date-time": {
        regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
        validator: (v) => !isNaN(Date.parse(v)),
      },
      time: {
        regex: /^\d{2}:\d{2}:\d{2}$/,
      },
      uri: {
        validator: (v) => {
          try {
            new URL(v)
            return true
          } catch {
            return false
          }
        },
      },
      "uri-reference": {
        validator: (v) => {
          try {
            new URL(v, "http://example.com")
            return true
          } catch {
            return false
          }
        },
      },
      "uri-template": {
        regex: /^(?:(?:[^{}])|(?:\{[^{}]+\}))*$/,
      },
      url: {
        validator: (v) => {
          try {
            new URL(v)
            return true
          } catch {
            return false
          }
        },
      },
      uuid: {
        regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      },
      ipv4: {
        regex: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      },
      ipv6: {
        regex: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
      },
      hostname: {
        regex: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      },
      phone: {
        regex: /^[+]?[1-9][\d]{0,15}$/,
        validator: (v) => /^[+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-()]/g, "")),
      },
      "credit-card": {
        validator: (v) => {
          const cleaned = v.replace(/\s/g, "")
          if (!/^\d{13,19}$/.test(cleaned)) return false
          // Luhn algorithm
          let sum = 0
          let isEven = false
          for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = Number.parseInt(cleaned[i])
            if (isEven) {
              digit *= 2
              if (digit > 9) digit -= 9
            }
            sum += digit
            isEven = !isEven
          }
          return sum % 10 === 0
        },
      },
      "postal-code": {
        validator: (v) => {
          const patterns = [
            /^\d{5}(-\d{4})?$/, // US ZIP
            /^[A-Z]\d[A-Z] \d[A-Z]\d$/, // Canadian
            /^\d{4,5}$/, // European
            /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // UK
          ]
          return patterns.some((pattern) => pattern.test(v))
        },
      },
      "semantic-version": {
        regex:
          /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      },
      "json-pointer": {
        validator: (v) => {
          if (v === "") return true
          return /^\/(?:[^/~]|~[01])*(?:\/(?:[^/~]|~[01])*)*$/.test(v)
        },
      },
      "color-hex": {
        regex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
      "mime-type": {
        regex: /^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*$/,
      },
    }

    const formatValidator = formatValidators[format]
    if (!formatValidator) {
      return null // Unknown format, skip validation
    }

    let isValid = true
    if (formatValidator.regex) {
      isValid = formatValidator.regex.test(value)
    }
    if (isValid && formatValidator.validator) {
      isValid = formatValidator.validator(value)
    }

    if (!isValid) {
      return this.createError("format", dataPath, schemaPath, {
        message: `Value at '${dataPath || "root"}' does not match format '${format}'`,
        category: "format",
        params: { format },
        suggestion: this.getFormatSuggestion(format),
        affectedValue: value,
      })
    }

    return null
  }

  private getFormatSuggestion(format: string): string {
    const suggestions: Record<string, string> = {
      email: "Use a valid email format like 'user@example.com'",
      date: "Use ISO date format like '2024-01-15'",
      "date-time": "Use ISO date-time format like '2024-01-15T10:30:00Z'",
      time: "Use time format like '10:30:00'",
      uri: "Use a valid URI format like 'https://example.com'",
      "uri-reference": "Use a valid URI reference",
      "uri-template": "Use a valid URI template format",
      url: "Use a valid URL format like 'https://example.com'",
      uuid: "Use a valid UUID format like '123e4567-e89b-12d3-a456-426614174000'",
      ipv4: "Use a valid IPv4 address like '192.168.1.1'",
      ipv6: "Use a valid IPv6 address",
      hostname: "Use a valid hostname format",
      phone: "Use a valid phone number format like '+1234567890'",
      "credit-card": "Use a valid credit card number format",
      "postal-code": "Use a valid postal code format for your region",
      "semantic-version": "Use semantic versioning format like '1.2.3' or '1.0.0-alpha.1'",
      "json-pointer": "Use JSON Pointer format like '/path/to/property'",
      "color-hex": "Use hex color format like '#FF0000' or '#F00'",
      "mime-type": "Use MIME type format like 'application/json'",
    }
    return suggestions[format] || `Ensure the value matches the '${format}' format requirements`
  }

  private createError(
    keyword: string,
    dataPath: string,
    schemaPath: string,
    options: {
      message: string
      category: ValidationError["category"]
      params?: any
      suggestion?: string
      affectedValue?: any
      expectedValue?: any
      severity?: "error" | "warning"
    },
  ): ValidationError {
    const lineInfo = this.getLineAndColumn(dataPath)

    return {
      instancePath: dataPath,
      schemaPath: schemaPath,
      keyword,
      params: options.params || {},
      message: options.message,
      lineNumber: lineInfo.line,
      columnNumber: lineInfo.column,
      severity: options.severity || "error",
      category: options.category,
      suggestion: options.suggestion,
      affectedValue: options.affectedValue,
      expectedValue: options.expectedValue,
      schemaLocation: this.getSchemaLocation(schemaPath),
      dataLocation: this.getDataLocation(dataPath),
    }
  }

  private getLineAndColumn(instancePath: string): { line?: number; column?: number } {
    if (!instancePath || instancePath === "") {
      return { line: 1, column: 1 }
    }

    try {
      const pathParts = instancePath.split(/[.[\]]/).filter((part) => part !== "")

      for (let i = 0; i < this.jsonLines.length; i++) {
        const line = this.jsonLines[i]

        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1]

          if (line.includes(`"${lastPart}"`)) {
            const column = line.indexOf(`"${lastPart}"`) + 1
            return { line: i + 1, column }
          }

          if (/^\d+$/.test(lastPart)) {
            const arrayPattern = new RegExp(`\\[\\s*${lastPart}\\s*\\]|\\[.*?\\]`)
            if (arrayPattern.test(line)) {
              return { line: i + 1, column: 1 }
            }
          }
        }
      }

      for (const part of pathParts.reverse()) {
        for (let i = 0; i < this.jsonLines.length; i++) {
          if (this.jsonLines[i].includes(`"${part}"`)) {
            return { line: i + 1, column: 1 }
          }
        }
      }
    } catch (error) {
      console.warn("Could not determine line number:", error)
    }

    return { line: 1, column: 1 }
  }

  private getSchemaLocation(schemaPath: string): string {
    if (!schemaPath) return "root"
    return schemaPath.replace(/^#\//, "").replace(/\//g, " → ")
  }

  private getDataLocation(instancePath: string): string {
    if (!instancePath) return "root"
    return instancePath.replace(/^\//, "").replace(/\//g, " → ")
  }

  private getJsonType(value: any): string {
    if (value === null) return "null"
    if (Array.isArray(value)) return "array"
    if (typeof value === "object") return "object"
    if (typeof value === "number") {
      return Number.isInteger(value) ? "integer" : "number"
    }
    return typeof value
  }

  private hasUniqueItems(array: any[]): boolean {
    const seen = new Set()
    for (const item of array) {
      const key = JSON.stringify(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
    }
    return true
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false

    if (typeof a === "object") {
      if (Array.isArray(a) !== Array.isArray(b)) return false

      if (Array.isArray(a)) {
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], b[i])) return false
        }
        return true
      } else {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false

        for (const key of keysA) {
          if (!keysB.includes(key)) return false
          if (!this.deepEqual(a[key], b[key])) return false
        }
        return true
      }
    }

    return false
  }

  public async validateBatch(
    files: Array<{ name: string; content: string }>,
    schemaData: string,
    options: ValidatorOptions = {},
  ): Promise<BatchValidationResult[]> {
    const results: BatchValidationResult[] = []

    for (const file of files) {
      const startTime = performance.now()
      try {
        const result = await this.validate(file.content, schemaData, options)
        const endTime = performance.now()

        results.push({
          fileName: file.name,
          result,
          processingTime: endTime - startTime,
        })
      } catch (error) {
        const endTime = performance.now()
        results.push({
          fileName: file.name,
          result: this.createUnexpectedErrorResult(error as Error, startTime),
          processingTime: endTime - startTime,
        })
      }
    }

    return results
  }

  public generateSchemaVisualization(schema: any): SchemaVisualization {
    if (!schema || typeof schema !== "object") {
      return { type: "unknown" }
    }

    // Handle $ref
    if (schema.$ref) {
      const resolvedSchema = this.resolveReference(schema.$ref)
      if (resolvedSchema) {
        const visualization = this.generateSchemaVisualization(resolvedSchema)
        visualization.$ref = schema.$ref
        return visualization
      }
      return { type: "unknown", $ref: schema.$ref }
    }

    const visualization: SchemaVisualization = {
      type: schema.type || "object",
      title: schema.title,
      description: schema.description,
      examples: schema.examples,
      default: schema.default,
    }

    if (schema.properties) {
      visualization.properties = {}
      Object.entries(schema.properties).forEach(([key, value]) => {
        visualization.properties![key] = this.generateSchemaVisualization(value)
      })
    }

    if (schema.items) {
      if (Array.isArray(schema.items)) {
        // Tuple validation - we'll just show the first item schema for simplicity
        visualization.items = this.generateSchemaVisualization(schema.items[0])
      } else {
        visualization.items = this.generateSchemaVisualization(schema.items)
      }
    }

    if (schema.required) {
      visualization.required = schema.required
    }

    if (schema.format) {
      visualization.format = schema.format
    }

    if (schema.enum) {
      visualization.enum = schema.enum
    }

    if (schema.minimum !== undefined) {
      visualization.minimum = schema.minimum
    }

    if (schema.maximum !== undefined) {
      visualization.maximum = schema.maximum
    }

    if (schema.minLength !== undefined) {
      visualization.minLength = schema.minLength
    }

    if (schema.maxLength !== undefined) {
      visualization.maxLength = schema.maxLength
    }

    if (schema.pattern) {
      visualization.pattern = schema.pattern
    }

    if (schema.additionalProperties !== undefined) {
      if (typeof schema.additionalProperties === "boolean") {
        visualization.additionalProperties = schema.additionalProperties
      } else {
        visualization.additionalProperties = this.generateSchemaVisualization(schema.additionalProperties)
      }
    }

    return visualization
  }

  private calculateSchemaComplexity(schema: any): number {
    if (!schema || typeof schema !== "object") {
      return 1
    }

    let complexity = 1

    // Handle $ref
    if (schema.$ref) {
      const resolvedSchema = this.resolveReference(schema.$ref)
      if (resolvedSchema) {
        return this.calculateSchemaComplexity(resolvedSchema) + 1
      }
      return 1
    }

    if (schema.properties) {
      complexity += Object.keys(schema.properties).length
      Object.values(schema.properties).forEach((prop: any) => {
        complexity += this.calculateSchemaComplexity(prop)
      })
    }

    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item: any) => {
          complexity += this.calculateSchemaComplexity(item)
        })
      } else {
        complexity += this.calculateSchemaComplexity(schema.items)
      }
    }

    if (schema.allOf) {
      schema.allOf.forEach((subSchema: any) => {
        complexity += this.calculateSchemaComplexity(subSchema)
      })
    }

    if (schema.anyOf) {
      schema.anyOf.forEach((subSchema: any) => {
        complexity += this.calculateSchemaComplexity(subSchema)
      })
    }

    if (schema.oneOf) {
      schema.oneOf.forEach((subSchema: any) => {
        complexity += this.calculateSchemaComplexity(subSchema)
      })
    }

    return complexity
  }

  private generateSchemaInfo(schema: any): ValidationResult["schemaInfo"] {
    if (!schema || typeof schema !== "object") {
      return {
        properties: 0,
        requiredFields: 0,
        hasExternalRefs: false,
      }
    }

    const info = {
      title: schema.title,
      description: schema.description,
      version: schema.version,
      properties: 0,
      requiredFields: 0,
      hasExternalRefs: false,
    }

    const countProperties = (obj: any): void => {
      if (!obj || typeof obj !== "object") return

      // Handle $ref
      if (obj.$ref) {
        if (typeof obj.$ref === "string" && !obj.$ref.startsWith("#")) {
          info.hasExternalRefs = true
        } else {
          const resolvedSchema = this.resolveReference(obj.$ref)
          if (resolvedSchema) {
            countProperties(resolvedSchema)
          }
        }
        return
      }

      if (obj.properties) {
        info.properties += Object.keys(obj.properties).length
        Object.values(obj.properties).forEach(countProperties)
      }

      if (obj.required && Array.isArray(obj.required)) {
        info.requiredFields += obj.required.length
      }
      // Recursively check nested schemas
      ;["items", "additionalProperties", "allOf", "anyOf", "oneOf", "not"].forEach((key) => {
        if (obj[key]) {
          if (Array.isArray(obj[key])) {
            obj[key].forEach(countProperties)
          } else {
            countProperties(obj[key])
          }
        }
      })
    }

    countProperties(schema)
    return info
  }

  private categorizeErrors(errors: ValidationError[]): Record<string, number> {
    const categories: Record<string, number> = {}

    for (const error of errors) {
      categories[error.category] = (categories[error.category] || 0) + 1
    }

    return categories
  }

  private createParseErrorResult(type: string, error: Error, startTime: number): ValidationResult {
    const parseError: ValidationError = {
      instancePath: "",
      schemaPath: "",
      keyword: "parse",
      params: {},
      message: `Failed to parse ${type}: ${error.message}`,
      severity: "error",
      category: "custom",
      suggestion: `Please check the ${type} syntax and ensure it's valid JSON or YAML`,
    }

    return {
      isValid: false,
      errors: [parseError],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        errorsByCategory: { custom: 1 },
        validationTime: performance.now() - startTime,
        schemaComplexity: 0,
        dataSize: 0,
        totalProperties: 0,
        requiredProperties: 0,
        validatedProperties: 0,
      },
    }
  }

  private createValidationErrorResult(error: Error, startTime: number): ValidationResult {
    const validationError: ValidationError = {
      instancePath: "",
      schemaPath: "",
      keyword: "validation",
      params: {},
      message: `Validation failed: ${error.message}`,
      severity: "error",
      category: "custom",
      suggestion: "Please check both JSON data and schema for any syntax issues",
    }

    return {
      isValid: false,
      errors: [validationError],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        errorsByCategory: { custom: 1 },
        validationTime: performance.now() - startTime,
        schemaComplexity: 0,
        dataSize: 0,
        totalProperties: 0,
        requiredProperties: 0,
        validatedProperties: 0,
      },
    }
  }

  private createUnexpectedErrorResult(error: Error, startTime: number): ValidationResult {
    const unexpectedError: ValidationError = {
      instancePath: "",
      schemaPath: "",
      keyword: "unexpected",
      params: {},
      message: `Unexpected validation error: ${error.message}`,
      severity: "error",
      category: "custom",
      suggestion: "Please check both JSON data and schema for any syntax issues",
    }

    return {
      isValid: false,
      errors: [unexpectedError],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        errorsByCategory: { custom: 1 },
        validationTime: performance.now() - startTime,
        schemaComplexity: 0,
        dataSize: 0,
        totalProperties: 0,
        requiredProperties: 0,
        validatedProperties: 0,
      },
    }
  }
}
