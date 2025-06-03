import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create charging stations table
    await sql`
      CREATE TABLE IF NOT EXISTS charging_stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT,
        connector_type VARCHAR(100),
        power_output INTEGER,
        status VARCHAR(50) DEFAULT 'available',
        price_per_kwh DECIMAL(5, 3),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({
      message: "Database tables created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if tables exist
    const usersCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `

    const stationsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'charging_stations'
      )
    `

    return NextResponse.json({
      tablesExist: {
        users: usersCheck[0].exists,
        charging_stations: stationsCheck[0].exists,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json({ error: "Failed to check database" }, { status: 500 })
  }
}
