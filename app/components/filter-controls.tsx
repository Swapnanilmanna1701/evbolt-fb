"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, X } from "lucide-react"

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

  const clearLocationSearch = () => {
    onFiltersChange({
      ...filters,
      searchLocation: "",
      searchCoords: null,
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
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
            <Label htmlFor="connectorType">Connector Type</Label>
            <Select value={filters.connectorType} onValueChange={(value) => updateFilter("connectorType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
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
            <Label htmlFor="maxPrice">Max Price ($/kWh)</Label>
            <Input
              id="maxPrice"
              type="number"
              step="0.01"
              placeholder="Any price"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>

          {/* Min Power Filter */}
          <div className="space-y-2">
            <Label htmlFor="minPower">Min Power (kW)</Label>
            <Input
              id="minPower"
              type="number"
              placeholder="Any power"
              value={filters.minPower}
              onChange={(e) => updateFilter("minPower", e.target.value)}
            />
          </div>
        </div>

        {/* Location Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="searchLocation">Search Location</Label>
            <div className="relative">
              <Input
                id="searchLocation"
                placeholder="Enter city, address, or landmark"
                value={filters.searchLocation}
                onChange={(e) => updateFilter("searchLocation", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onLocationSearch()}
                className="pr-8"
              />
              {filters.searchLocation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={clearLocationSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Search Radius (km)</Label>
            <Select
              value={filters.radius.toString()}
              onValueChange={(value) => updateFilter("radius", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button onClick={onLocationSearch} disabled={loading || !filters.searchLocation.trim()} className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button variant="outline" onClick={onClearFilters}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Active Location Filter Display */}
        {filters.searchCoords && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-700">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  Showing stations within {filters.radius}km of "{filters.searchLocation}"
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLocationSearch}
                className="text-blue-700 hover:text-blue-900"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
