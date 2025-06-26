import { JsonComparator } from "@/components/json-comparator"
import { JsonProvider } from "@/contexts/json-context"

export default function ComparatorPage() {
  return (
    <div className="w-full h-full">
      <JsonProvider>
        <JsonComparator />
      </JsonProvider>
    </div>
  )
}
