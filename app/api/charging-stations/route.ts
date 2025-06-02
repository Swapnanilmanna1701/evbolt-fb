import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

// Use the serverless driver with no native dependencies
const sql = neon(process.env.DATABASE_URL!)

function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return null
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any
    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  const user = authenticateToken(request)

  if (!user) {
    return NextResponse.json({ error: "Access token required" }, { status: 401 })
  }

  try {
    const stations = await sql`
      SELECT cs.*, u.username as created_by_username 
      FROM charging_stations cs 
      LEFT JOIN users u ON cs.created_by = u.id 
      ORDER BY cs.created_at DESC
    `

    return NextResponse.json(stations)
  } catch (error) {
    console.error("Error fetching charging stations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = authenticateToken(request)

  if (!user) {
    return NextResponse.json({ error: "Access token required" }, { status: 401 })
  }

  try {
    const { name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh } =
      await request.json()

    if (!name || !latitude || !longitude) {
      return NextResponse.json({ error: "Name, latitude, and longitude are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO charging_stations 
      (name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh, created_by)
      VALUES (${name}, ${latitude}, ${longitude}, ${address || null}, ${connector_type || null}, 
              ${power_output || null}, ${status || "available"}, ${price_per_kwh || null}, ${user.userId})
      RETURNING *
    `

    return NextResponse.json(
      {
        message: "Charging station created successfully",
        station: result[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating charging station:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
