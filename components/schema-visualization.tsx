"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Hash,
  Type,
  FileText,
  List,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import type { SchemaVisualization } from "@/lib/schema-validator-enhanced"

interface SchemaVisualizationProps {
  schema: SchemaVisualization
  onPropertyClick?: (path: string) => void
  path?: string
  level?: number
}

export function SchemaVisualizationComponent({
  schema,
  onPropertyClick,
  path = "",
  level = 0,
}: SchemaVisualizationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]))

  const toggleNode = (nodePath: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath)
    } else {
      newExpanded.add(nodePath)
    }
    setExpandedNodes(newExpanded)
  }

  const copyPath = async (pathToCopy: string) => {
    try {
      await navigator.clipboard.writeText(pathToCopy)
    } catch (err) {
      console.error("Failed to copy path:", err)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "object":
        return <Hash className="h-4 w-4 text-blue-500" />
      case "array":
        return <List className="h-4 w-4 text-green-500" />
      case "string":
        return <Type className="h-4 w-4 text-purple-500" />
      case "number":
      case "integer":
        return <Hash className="h-4 w-4 text-orange-500" />
      case "boolean":
        return <CheckCircle className="h-4 w-4 text-teal-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      object: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      array: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      string: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      number: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      integer: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      boolean: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }

  const renderConstraints = (schema: SchemaVisualization) => {
    const constraints: string[] = []

    if (schema.minimum !== undefined) constraints.push(`min: ${schema.minimum}`)
    if (schema.maximum !== undefined) constraints.push(`max: ${schema.maximum}`)
    if (schema.minLength !== undefined) constraints.push(`minLength: ${schema.minLength}`)
    if (schema.maxLength !== undefined) constraints.push(`maxLength: ${schema.maxLength}`)
    if (schema.pattern) constraints.push(`pattern: ${schema.pattern}`)
    if (schema.format) constraints.push(`format: ${schema.format}`)

    return constraints
  }

  const renderSchemaNode = (nodeSchema: SchemaVisualization, nodePath: string, propertyName?: string) => {
    const isExpanded = expandedNodes.has(nodePath)
    const hasChildren = nodeSchema.properties || nodeSchema.items
    const isRequired = schema.required?.includes(propertyName || "") || false
    const constraints = renderConstraints(nodeSchema)

    return (
      <div key={nodePath} className={`${level > 0 ? "ml-4 border-l border-muted pl-4" : ""}`}>
        <Collapsible open={isExpanded} onOpenChange={() => toggleNode(nodePath)}>
          <div className="flex items-center gap-2 py-2 hover:bg-muted/30 rounded-lg px-2 transition-colors">
            {hasChildren && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
            )}

            {!hasChildren && <div className="w-6" />}

            <div className="flex items-center gap-2 flex-1">
              {getTypeIcon(nodeSchema.type)}

              <div className="flex items-center gap-2">
                {propertyName && (
                  <span className="font-medium text-foreground">
                    {propertyName}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </span>
                )}

                <Badge className={getTypeColor(nodeSchema.type)}>{nodeSchema.type}</Badge>

                {nodeSchema.format && (
                  <Badge variant="outline" className="text-xs">
                    {nodeSchema.format}
                  </Badge>
                )}

                {isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    required
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyPath(nodePath)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy path</TooltipContent>
              </Tooltip>

              {onPropertyClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onPropertyClick(nodePath)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Navigate to property</TooltipContent>
                </Tooltip>
              )}

              {nodeSchema.$ref && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>External reference: {nodeSchema.$ref}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Description and details */}
          <div className="ml-8 space-y-2">
            {nodeSchema.description && <p className="text-sm text-muted-foreground italic">{nodeSchema.description}</p>}

            {constraints.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {constraints.map((constraint, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {constraint}
                  </Badge>
                ))}
              </div>
            )}

            {nodeSchema.enum && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Allowed values:</span>
                <div className="flex flex-wrap gap-1">
                  {nodeSchema.enum.map((value, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {JSON.stringify(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {nodeSchema.default !== undefined && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Default:</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {JSON.stringify(nodeSchema.default)}
                </Badge>
              </div>
            )}

            {nodeSchema.examples && nodeSchema.examples.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Examples:</span>
                <div className="flex flex-wrap gap-1">
                  {nodeSchema.examples.slice(0, 3).map((example, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {JSON.stringify(example)}
                    </Badge>
                  ))}
                  {nodeSchema.examples.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{nodeSchema.examples.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Children */}
          <CollapsibleContent>
            <div className="mt-2">
              {nodeSchema.properties &&
                Object.entries(nodeSchema.properties).map(([propName, propSchema]) =>
                  renderSchemaNode(propSchema, `${nodePath}/${propName}`, propName),
                )}

              {nodeSchema.items && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Array items:</div>
                  {renderSchemaNode(nodeSchema.items, `${nodePath}/items`, "items")}
                </div>
              )}

              {typeof nodeSchema.additionalProperties === "object" && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Additional properties:</div>
                  {renderSchemaNode(
                    nodeSchema.additionalProperties,
                    `${nodePath}/additionalProperties`,
                    "additionalProperties",
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  if (!schema) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No schema available for visualization</p>
        </div>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Schema Visualization
            {schema.title && <Badge variant="outline">{schema.title}</Badge>}
          </CardTitle>
          {schema.description && <p className="text-sm text-muted-foreground">{schema.description}</p>}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">{renderSchemaNode(schema, path || "root")}</div>

          {/* Schema Statistics */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{schema.properties ? Object.keys(schema.properties).length : 0}</div>
                <div className="text-sm text-muted-foreground">Properties</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{schema.required?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Required</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{schema.type}</div>
                <div className="text-sm text-muted-foreground">Root Type</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{schema.$ref ? "Yes" : "No"}</div>
                <div className="text-sm text-muted-foreground">Has Refs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
