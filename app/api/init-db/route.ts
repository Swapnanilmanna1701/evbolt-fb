import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import ChargingStation from "@/models/ChargingStation"
import mongoose from "mongoose" // Declare mongoose variable

export async function POST() {
  try {
    await connectDB()

    // Initialize models (this will create collections if they don't exist)
    await User.init()
    await ChargingStation.init()

    return NextResponse.json({
      message: "Database initialized successfully",
      collections: ["users", "chargingstations"],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    // Count documents
    const userCount = await User.countDocuments()
    const stationCount = await ChargingStation.countDocuments() // Ensure stationCount is awaited

    return NextResponse.json({
      collections: collectionNames,
      counts: {
        users: userCount,
        chargingStations: stationCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json({ error: "Failed to check database" }, { status: 500 })
  }
}
