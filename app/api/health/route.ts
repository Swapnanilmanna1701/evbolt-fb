import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Use the serverless driver with no native dependencies
const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as time`

    return NextResponse.json({
      status: "OK",
      message: "Charging Station API is running",
      timestamp: new Date().toISOString(),
      dbConnected: true,
      dbTime: result[0].time,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "ERROR",
        message: "API is running but database connection failed",
        timestamp: new Date().toISOString(),
        dbConnected: false,
      },
      { status: 500 },
    )
  }
}
