import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()

    const dbStatus = mongoose.connection.readyState
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    return NextResponse.json({
      status: "OK",
      message: "Charging Station API is running",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStates[dbStatus as keyof typeof dbStates],
        connected: dbStatus === 1,
      },
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "ERROR",
        message: "API is running but database connection failed",
        timestamp: new Date().toISOString(),
        database: {
          status: "error",
          connected: false,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
