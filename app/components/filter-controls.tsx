"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Filter, X } from "lucide-react"

interface FilterState {
  status: string
  connectorType: string
  maxPrice: string
  minPower: string
  searchLocation: string
  radius: number
  searchCoords: { lat: number; lng: number } | null
}

interface FilterControlsProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onLocationSearch: () => void
  onClearFilters: () => void
  loading: boolean
}

export function FilterControls({
  filters,
  onFiltersChange,
  onLocationSearch,
  onClearFilters,
  loading,
}: FilterControlsProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.connectorType !== "all" ||
    filters.maxPrice ||
    filters.minPower ||
    filters.searchCoords

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Charging Stations
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Search */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium">Search by Location</Label>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter city, address, or landmark..."
                value={filters.searchLocation}
                onChange={(e) => updateFilter("searchLocation", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onLocationSearch()}
              />
            </div>
            <Button onClick={onLocationSearch} disabled={loading || !filters.searchLocation.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          {filters.searchCoords && (
            <div className="space-y-2">
              <Label className="text-sm">Search Radius: {filters.radius}km</Label>
              <Slider
                value={[filters.radius]}
                onValueChange={(value) => updateFilter("radius", value[0])}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>
          )}
        </div>

        {/* Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Status</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Connector Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Connector Type</Label>
            <Select value={filters.connectorType} onValueChange={(value) => updateFilter("connectorType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Type 1">Type 1</SelectItem>
                <SelectItem value="Type 2">Type 2</SelectItem>
                <SelectItem value="CCS">CCS</SelectItem>
                <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                <SelectItem value="Tesla">Tesla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Price Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Max Price ($/kWh)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g., 0.50"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>

          {/* Min Power Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Min Power (kW)</Label>
            <Input
              type="number"
              placeholder="e.g., 50"
              value={filters.minPower}
              onChange={(e) => updateFilter("minPower", e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.status !== "all" && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Status: {filters.status}</div>
              )}
              {filters.connectorType !== "all" && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Type: {filters.connectorType}
                </div>
              )}
              {filters.maxPrice && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Max Price: ${filters.maxPrice}/kWh
                </div>
              )}
              {filters.minPower && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Min Power: {filters.minPower}kW
                </div>
              )}
              {filters.searchCoords && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Within {filters.radius}km of {filters.searchLocation}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
