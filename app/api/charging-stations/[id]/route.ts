import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ChargingStation from "@/models/ChargingStation"
import { authenticateRequest } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid station ID" }, { status: 400 })
    }

    const station = await ChargingStation.findById(id).populate("createdBy", "username email")

    if (!station) {
      return NextResponse.json({ error: "Charging station not found" }, { status: 404 })
    }

    return NextResponse.json(station)
  } catch (error) {
    console.error("Error fetching charging station:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid station ID" }, { status: 400 })
    }

    const { name, latitude, longitude, address, connectorType, powerOutput, status, pricePerKwh } = await request.json()

    const updateData: any = {}

    if (name !== undefined) updateData.name = name.trim()
    if (latitude !== undefined) {
      const lat = Number(latitude)
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json({ error: "Invalid latitude value" }, { status: 400 })
      }
      updateData.latitude = lat
    }
    if (longitude !== undefined) {
      const lng = Number(longitude)
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json({ error: "Invalid longitude value" }, { status: 400 })
      }
      updateData.longitude = lng
    }
    if (address !== undefined) updateData.address = address?.trim()
    if (connectorType !== undefined) updateData.connectorType = connectorType
    if (powerOutput !== undefined) updateData.powerOutput = powerOutput ? Number(powerOutput) : undefined
    if (status !== undefined) updateData.status = status
    if (pricePerKwh !== undefined) updateData.pricePerKwh = pricePerKwh ? Number(pricePerKwh) : undefined

    const station = await ChargingStation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "username email")

    if (!station) {
      return NextResponse.json({ error: "Charging station not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Charging station updated successfully",
      station,
    })
  } catch (error: any) {
    console.error("Error updating charging station:", error)

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid station ID" }, { status: 400 })
    }

    const station = await ChargingStation.findByIdAndDelete(id)

    if (!station) {
      return NextResponse.json({ error: "Charging station not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Charging station deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting charging station:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
