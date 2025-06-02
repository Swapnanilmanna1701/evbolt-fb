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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = authenticateToken(request)

  if (!user) {
    return NextResponse.json({ error: "Access token required" }, { status: 401 })
  }

  try {
    const { id } = params
    const result = await sql`
      SELECT cs.*, u.username as created_by_username 
      FROM charging_stations cs 
      LEFT JOIN users u ON cs.created_by = u.id 
      WHERE cs.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Charging station not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching charging station:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = authenticateToken(request)

  if (!user) {
    return NextResponse.json({ error: "Access token required" }, { status: 401 })
  }

  try {
    const { id } = params
    const { name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh } =
      await request.json()

    const result = await sql`
      UPDATE charging_stations 
      SET name = ${name}, latitude = ${latitude}, longitude = ${longitude}, address = ${address || null}, 
          connector_type = ${connector_type || null}, power_output = ${power_output || null}, 
          status = ${status}, price_per_kwh = ${price_per_kwh || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Charging station not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Charging station updated successfully",
      station: result[0],
    })
  } catch (error) {
    console.error("Error updating charging station:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = authenticateToken(request)

  if (!user) {
    return NextResponse.json({ error: "Access token required" }, { status: 401 })
  }

  try {
    const { id } = params
    const result = await sql`DELETE FROM charging_stations WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Charging station not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Charging station deleted successfully" })
  } catch (error) {
    console.error("Error deleting charging station:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
