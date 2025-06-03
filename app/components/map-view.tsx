"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import { divIcon } from "leaflet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, DollarSign, Edit, Trash2, Navigation } from "lucide-react"
import "leaflet/dist/leaflet.css"

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

interface MapViewProps {
  stations: ChargingStation[]
  onStationSelect: (station: ChargingStation) => void
  onStationDelete: (id: string) => void
  searchLocation?: { lat: number; lng: number } | null
  searchRadius?: number
}

// Custom marker icons based on status
const createCustomIcon = (status: string, isHighlighted = false) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "#10b981" // green
      case "occupied":
        return "#f59e0b" // yellow
      case "maintenance":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  const size = isHighlighted ? 32 : 24
  const borderWidth = isHighlighted ? 4 : 3

  return divIcon({
    html: `
      <div style="
        background-color: ${getStatusColor(status)};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${borderWidth}px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isHighlighted ? "animation: pulse 2s infinite;" : ""}
      ">
        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
    `,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Search location marker
const createSearchIcon = () => {
  return divIcon({
    html: `
      <div style="
        background-color: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
    `,
    className: "search-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Component to fit map bounds to show all stations and search area
function MapBounds({
  stations,
  searchLocation,
  searchRadius,
}: {
  stations: ChargingStation[]
  searchLocation?: { lat: number; lng: number } | null
  searchRadius?: number
}) {
  const map = useMap()

  useEffect(() => {
    const bounds: [number, number][] = []

    // Add station locations to bounds
    stations.forEach((station) => {
      bounds.push([station.latitude, station.longitude])
    })

    // Add search location to bounds if it exists
    if (searchLocation) {
      bounds.push([searchLocation.lat, searchLocation.lng])

      // Add search radius bounds
      if (searchRadius) {
        const radiusInDegrees = searchRadius / 111 // Rough conversion from km to degrees
        bounds.push([searchLocation.lat + radiusInDegrees, searchLocation.lng + radiusInDegrees])
        bounds.push([searchLocation.lat - radiusInDegrees, searchLocation.lng - radiusInDegrees])
      }
    }

    if (bounds.length === 1) {
      // If only one point, center on it with a reasonable zoom
      map.setView(bounds[0], 13)
    } else if (bounds.length > 1) {
      // If multiple points, fit bounds to show all
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [stations, searchLocation, searchRadius, map])

  return null
}

export default function MapView({
  stations,
  onStationSelect,
  onStationDelete,
  searchLocation,
  searchRadius = 10,
}: MapViewProps) {
  const mapRef = useRef<any>(null)

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

  // Default center (you can adjust this to your preferred location)
  const defaultCenter: [number, number] = [40.7128, -74.006] // New York City

  return (
    <div className="relative h-full w-full">
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>

      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds stations={stations} searchLocation={searchLocation} searchRadius={searchRadius} />

        {/* Search location marker and radius */}
        {searchLocation && (
          <>
            <Marker position={[searchLocation.lat, searchLocation.lng]} icon={createSearchIcon()}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">Search Location</h3>
                  <p className="text-sm text-gray-600">
                    {searchLocation.lat.toFixed(4)}, {searchLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[searchLocation.lat, searchLocation.lng]}
              radius={searchRadius * 1000} // Convert km to meters
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          </>
        )}

        {/* Charging station markers */}
        {stations.map((station) => (
          <Marker
            key={station._id}
            position={[station.latitude, station.longitude]}
            icon={createCustomIcon(station.status, station.distance !== undefined)}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2 min-w-[250px]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{station.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                      {station.distance && (
                        <span className="ml-2 text-blue-600 font-medium">{station.distance.toFixed(1)}km away</span>
                      )}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(station.status)} text-white text-xs`}>{station.status}</Badge>
                </div>

                {station.address && <p className="text-sm text-gray-600 mb-2">{station.address}</p>}

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {station.connectorType || "N/A"}
                    </span>
                    <span>{station.powerOutput ? `${station.powerOutput} kW` : "N/A"}</span>
                  </div>

                  {station.pricePerKwh && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-3 h-3 mr-1" />${station.pricePerKwh}/kWh
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Created {new Date(station.createdAt).toLocaleDateString()}
                </div>

                <div className="flex justify-between space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`
                      window.open(url, "_blank")
                    }}
                    className="text-xs flex-1"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Directions
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onStationSelect(station)} className="text-xs">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onStationDelete(station._id)} className="text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Station Status</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Available
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            Occupied
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            Maintenance
          </div>
          {searchLocation && (
            <div className="flex items-center text-xs pt-1 border-t">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Search Area
            </div>
          )}
        </div>
      </div>

      {stations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-[1000]">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stations to display</h3>
            <p className="text-gray-600">Add charging stations or adjust your filters</p>
          </div>
        </div>
      )}
    </div>
  )
}
