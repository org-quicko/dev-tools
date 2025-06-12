import { JsonComparator } from "@/components/json-comparator"
import { JsonProvider } from "@/contexts/json-context"

export default function ComparatorPage() {
  return (
    <JsonProvider>
      <div className="min-h-screen bg-background">
        <JsonComparator />
      </div>
    </JsonProvider>
  )
}
