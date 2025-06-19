import type React from "react"

interface Column {
  title?: string
  content: React.ReactNode
  width?: string
  minWidth?: string
  flex?: string
  header?: boolean
  actions?: React.ReactNode
}

interface FlexibleToolLayoutProps {
  columns: Column[]
}

const FlexibleToolLayout: React.FC<FlexibleToolLayoutProps> = ({ columns }) => {
  return (
    <div className="flex h-full w-full gap-3 overflow-hidden">
      {columns.map((column, index) => (
        <div
          key={index}
          className={`
            flex flex-col overflow-hidden
            ${index < columns.length - 1 ? "border-r border-border" : ""}
          `}
          style={{
            minWidth: column.minWidth || "300px",
            width: column.width || "auto",
            flex: column.flex || "none",
          }}
        >
          {column.header && (
            <div className="flex-shrink-0 border-b border-border bg-muted/30 px-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
                {column.actions && <div className="flex items-center gap-1">{column.actions}</div>}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-auto p-3">{column.content}</div>
        </div>
      ))}
    </div>
  )
}

export default FlexibleToolLayout
