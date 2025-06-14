"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Zap, DollarSign, Plus, Edit, Trash2, LogOut, UserIcon, Filter, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import { FilterControls } from "./components/filter-controls"

const MapView = dynamic(() => import("./components/map-view"), { ssr: false })

interface ChargingStation {
  _id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  connectorType?: string
  powerOutput?: number
  status: string
  pricePerKwh?: number
  createdBy: {
    _id: string
    username: string
    email: string
  }
  createdAt: string
  updatedAt: string
  distance?: number
}

interface AppUser {
  id: string
  username: string
  email: string
}

interface FilterState {
  status: string
  connectorType: string
  maxPrice: string
  minPower: string
  searchLocation: string
  radius: number
  searchCoords: { lat: number; lng: number } | null
}

export default function ChargingStationApp() {
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [allStations, setAllStations] = useState<ChargingStation[]>([])
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showStationDialog, setShowStationDialog] = useState(false)
  const [editingStation, setEditingStation] = useState<ChargingStation | null>(null)
  const [activeView, setActiveView] = useState<"grid" | "map">("grid")
  const { toast } = useToast()

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    connectorType: "all",
    maxPrice: "",
    minPower: "",
    searchLocation: "",
    radius: 10,
    searchCoords: null,
  })

  // Auth form state
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  })

  // Station form state
  const [stationForm, setStationForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
    connectorType: "",
    powerOutput: "",
    status: "available",
    pricePerKwh: "",
  })

  // Real-time updates interval
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchStations(true) // Silent refresh
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [token])

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setAppUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchStations()
    }
  }, [token])

  // Fetch stations with filters applied
  const fetchStations = useCallback(
    async (silent = false) => {
      if (!token) return

      if (!silent) setLoading(true)
      setRefreshing(true)

      try {
        // Build query parameters
        const params = new URLSearchParams()

        if (filters.status !== "all") {
          params.append("status", filters.status)
        }

        if (filters.connectorType !== "all") {
          params.append("connectorType", filters.connectorType)
        }

        if (filters.maxPrice) {
          params.append("maxPrice", filters.maxPrice)
        }

        if (filters.minPower) {
          params.append("minPower", filters.minPower)
        }

        if (filters.searchCoords) {
          params.append("lat", filters.searchCoords.lat.toString())
          params.append("lng", filters.searchCoords.lng.toString())
          params.append("radius", filters.radius.toString())
        }

        const response = await fetch(`/api/charging-stations?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setAllStations(data)
          setFilteredStations(data)
          if (!silent) {
            toast({
              title: "Stations updated",
              description: `Found ${data.length} charging stations`,
            })
          }
        } else {
          throw new Error("Failed to fetch stations")
        }
      } catch (error) {
        if (!silent) {
          toast({
            title: "Error",
            description: "Failed to fetch charging stations",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, filters, toast],
  )

  // Refetch when filters change
  useEffect(() => {
    if (token) {
      fetchStations(true)
    }
  }, [fetchStations])

  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  const handleLocationSearch = async () => {
    if (!filters.searchLocation.trim()) {
      setFilters((prev) => ({ ...prev, searchCoords: null }))
      return
    }

    setLoading(true)
    try {
      const coords = await geocodeLocation(filters.searchLocation)
      if (coords) {
        setFilters((prev) => ({ ...prev, searchCoords: coords }))
        toast({
          title: "Location found",
          description: `Showing stations within ${filters.radius}km of ${filters.searchLocation}`,
        })
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different location or be more specific",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Search error",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register"
      const body = authMode === "login" ? { email: authForm.email, password: authForm.password } : authForm

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setAppUser(data.user)
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setAuthForm({ username: "", email: "", password: "" })
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setAppUser(null)
    setAllStations([])
    setFilteredStations([])
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingStation ? "PUT" : "POST"
      const url = editingStation ? `/api/charging-stations/${editingStation._id}` : "/api/charging-stations"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...stationForm,
          latitude: Number.parseFloat(stationForm.latitude),
          longitude: Number.parseFloat(stationForm.longitude),
          powerOutput: stationForm.powerOutput ? Number.parseInt(stationForm.powerOutput) : null,
          pricePerKwh: stationForm.pricePerKwh ? Number.parseFloat(stationForm.pricePerKwh) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        })
        setShowStationDialog(false)
        setEditingStation(null)
        setStationForm({
          name: "",
          latitude: "",
          longitude: "",
          address: "",
          connectorType: "",
          powerOutput: "",
          status: "available",
          pricePerKwh: "",
        })
        fetchStations()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charging station?")) return

    try {
      const response = await fetch(`/api/charging-stations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Charging station deleted successfully",
        })
        fetchStations()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete charging station",
        variant: "destructive",
      })
    }
  }

  const handleEditStation = (station: ChargingStation) => {
    setEditingStation(station)
    setStationForm({
      name: station.name,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString(),
      address: station.address || "",
      connectorType: station.connectorType || "",
      powerOutput: station.powerOutput?.toString() || "",
      status: station.status,
      pricePerKwh: station.pricePerKwh?.toString() || "",
    })
    setShowStationDialog(true)
  }

  const handleAddStationFromMap = (lat: number, lng: number) => {
    setEditingStation(null)
    setStationForm({
      name: "",
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: "",
      connectorType: "",
      powerOutput: "",
      status: "available",
      pricePerKwh: "",
    })
    setShowStationDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      connectorType: "all",
      maxPrice: "",
      minPower: "",
      searchLocation: "",
      radius: 10,
      searchCoords: null,
    })
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Charging Station Manager</CardTitle>
            <CardDescription>
              {authMode === "login" ? "Sign in to your account" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Charging Station Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchStations()}
                disabled={refreshing}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="w-4 h-4 mr-1" />
                {appUser?.username}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <FilterControls
          filters={filters}
          onFiltersChange={setFilters}
          onLocationSearch={handleLocationSearch}
          onClearFilters={clearFilters}
          loading={loading}
        />

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Showing {filteredStations.length} charging stations
                {filters.searchCoords && (
                  <span className="ml-2 text-blue-600">
                    within {filters.radius}km of {filters.searchLocation}
                  </span>
                )}
              </p>
            </div>
            <Dialog open={showStationDialog} onOpenChange={setShowStationDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingStation(null)
                    setStationForm({
                      name: "",
                      latitude: "",
                      longitude: "",
                      address: "",
                      connectorType: "",
                      powerOutput: "",
                      status: "available",
                      pricePerKwh: "",
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Station
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingStation ? "Edit Charging Station" : "Add New Charging Station"}</DialogTitle>
                  <DialogDescription>
                    {editingStation
                      ? "Update the charging station details"
                      : "Enter the details for the new charging station"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleStationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Station Name</Label>
                    <Input
                      id="name"
                      value={stationForm.name}
                      onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={stationForm.latitude}
                        onChange={(e) => setStationForm({ ...stationForm, latitude: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={stationForm.longitude}
                        onChange={(e) => setStationForm({ ...stationForm, longitude: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={stationForm.address}
                      onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="connectorType">Connector Type</Label>
                      <Select
                        value={stationForm.connectorType}
                        onValueChange={(value) => setStationForm({ ...stationForm, connectorType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Type 1">Type 1</SelectItem>
                          <SelectItem value="Type 2">Type 2</SelectItem>
                          <SelectItem value="CCS">CCS</SelectItem>
                          <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                          <SelectItem value="Tesla">Tesla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="powerOutput">Power (kW)</Label>
                      <Input
                        id="powerOutput"
                        type="number"
                        value={stationForm.powerOutput}
                        onChange={(e) => setStationForm({ ...stationForm, powerOutput: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={stationForm.status}
                        onValueChange={(value) => setStationForm({ ...stationForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerKwh">Price per kWh</Label>
                      <Input
                        id="pricePerKwh"
                        type="number"
                        step="0.01"
                        value={stationForm.pricePerKwh}
                        onChange={(e) => setStationForm({ ...stationForm, pricePerKwh: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowStationDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingStation ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Map and Stations Toggle */}
        <div className="mb-6">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "grid" | "map")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="h-[600px] w-full">
                    <MapView
                      stations={filteredStations}
                      onStationSelect={handleEditStation}
                      onStationDelete={handleDeleteStation}
                      onAddStation={handleAddStationFromMap}
                      searchLocation={filters.searchCoords}
                      searchRadius={filters.radius}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grid" className="mt-6">
              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStations.map((station) => (
                  <Card key={station._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{station.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                            {station.distance && (
                              <span className="ml-2 text-blue-600 font-medium">
                                {station.distance.toFixed(1)}km away
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(station.status)} text-white`}>{station.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {station.address && <p className="text-sm text-gray-600">{station.address}</p>}
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          {station.connectorType || "N/A"}
                        </span>
                        <span>{station.powerOutput ? `${station.powerOutput} kW` : "N/A"}</span>
                      </div>
                      {station.pricePerKwh && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="w-4 h-4 mr-1" />${station.pricePerKwh}/kWh
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Created {new Date(station.createdAt).toLocaleDateString()} by {station.createdBy.username}
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditStation(station)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteStation(station._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredStations.length === 0 && (
                <div className="text-center py-12">
                  {allStations.length > 0 ? (
                    <>
                      <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No stations match your filters</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                      <Button onClick={clearFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No charging stations yet</h3>
                      <p className="text-gray-600 mb-4">Get started by adding your first charging station</p>
                      <Button onClick={() => setShowStationDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Station
                      </Button>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
