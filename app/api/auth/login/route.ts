import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

// Use the serverless driver with no native dependencies
const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    const user = result[0]

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET!, { expiresIn: "24h" })

    return NextResponse.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
