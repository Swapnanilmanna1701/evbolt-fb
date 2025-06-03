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

    const stations = await ChargingStation.find().populate("createdBy", "username email").sort({ createdAt: -1 })

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

    const station = new ChargingStation({
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
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
