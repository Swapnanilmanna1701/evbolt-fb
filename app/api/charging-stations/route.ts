import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ChargingStation from "@/models/ChargingStation"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectDB()

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const connectorType = searchParams.get("connectorType")
    const maxPrice = searchParams.get("maxPrice")
    const minPower = searchParams.get("minPower")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius")

    // Build filter object
    const filter: any = {}

    if (status && status !== "all") {
      filter.status = status
    }

    if (connectorType && connectorType !== "all") {
      filter.connectorType = connectorType
    }

    if (maxPrice) {
      filter.pricePerKwh = { $lte: Number.parseFloat(maxPrice) }
    }

    if (minPower) {
      filter.powerOutput = { $gte: Number.parseInt(minPower) }
    }

    // Location-based filtering
    if (lat && lng && radius) {
      const latitude = Number.parseFloat(lat)
      const longitude = Number.parseFloat(lng)
      const radiusKm = Number.parseFloat(radius)

      // Convert radius from km to radians (Earth radius ≈ 6371 km)
      const radiusRadians = radiusKm / 6371

      filter.latitude = {
        $gte: latitude - (radiusRadians * 180) / Math.PI,
        $lte: latitude + (radiusRadians * 180) / Math.PI,
      }
      filter.longitude = {
        $gte: longitude - (radiusRadians * 180) / Math.PI / Math.cos((latitude * Math.PI) / 180),
        $lte: longitude + (radiusRadians * 180) / Math.PI / Math.cos((latitude * Math.PI) / 180),
      }
    }

    const stations = await ChargingStation.find(filter).populate("createdBy", "username email").sort({ createdAt: -1 })

    // Calculate distances if location is provided
    if (lat && lng) {
      const latitude = Number.parseFloat(lat)
      const longitude = Number.parseFloat(lng)

      const stationsWithDistance = stations.map((station) => {
        const distance = calculateDistance(latitude, longitude, station.latitude, station.longitude)
        return {
          ...station.toObject(),
          distance,
        }
      })

      // Sort by distance if location filtering is applied
      if (radius) {
        stationsWithDistance.sort((a, b) => a.distance - b.distance)
      }

      return NextResponse.json(stationsWithDistance)
    }

    return NextResponse.json(stations)
  } catch (error) {
    console.error("Error fetching charging stations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectDB()

    const { name, latitude, longitude, address, connectorType, powerOutput, status, pricePerKwh } = await request.json()

    // Validation
    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Name, latitude, and longitude are required" }, { status: 400 })
    }

    // Validate coordinates
    const lat = Number(latitude)
    const lng = Number(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid latitude or longitude values" }, { status: 400 })
    }

    const station = new ChargingStation({
      name: name.trim(),
      latitude: lat,
      longitude: lng,
      address: address?.trim(),
      connectorType,
      powerOutput: powerOutput ? Number(powerOutput) : undefined,
      status: status || "available",
      pricePerKwh: pricePerKwh ? Number(pricePerKwh) : undefined,
      createdBy: user.userId,
    })

    await station.save()

    // Populate the created station
    await station.populate("createdBy", "username email")

    return NextResponse.json(
      {
        message: "Charging station created successfully",
        station,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating charging station:", error)

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
