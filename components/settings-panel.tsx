"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ComparisonSettings } from "@/types/comparison"

interface SettingsPanelProps {
  settings: ComparisonSettings
  onSettingsChange: (settings: ComparisonSettings) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const updateSetting = <K extends keyof ComparisonSettings>(key: K, value: ComparisonSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Formatting Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="indentation">Indentation</Label>
            <Select
              value={settings.indentation.toString()}
              onValueChange={(value) => updateSetting("indentation", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
                <SelectItem value="8">8 spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sort-keys">Sort Keys Alphabetically</Label>
            <Switch
              id="sort-keys"
              checked={settings.sortKeys}
              onCheckedChange={(checked) => updateSetting("sortKeys", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ignore-order">Ignore Array Order</Label>
              <p className="text-sm text-muted-foreground">Compare arrays by content, not position</p>
            </div>
            <Switch
              id="ignore-order"
              checked={settings.ignoreOrder}
              onCheckedChange={(checked) => updateSetting("ignoreOrder", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="fuzzy-match">Fuzzy String Matching</Label>
              <p className="text-sm text-muted-foreground">Match similar strings with minor differences</p>
            </div>
            <Switch
              id="fuzzy-match"
              checked={settings.fuzzyMatch}
              onCheckedChange={(checked) => updateSetting("fuzzyMatch", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ignore-case">Ignore Case</Label>
              <p className="text-sm text-muted-foreground">Case-insensitive string comparison</p>
            </div>
            <Switch
              id="ignore-case"
              checked={settings.ignoreCase}
              onCheckedChange={(checked) => updateSetting("ignoreCase", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
