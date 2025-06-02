import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

// Use the serverless driver with no native dependencies
const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} OR username = ${username}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await sql`
      INSERT INTO users (username, email, password) 
      VALUES (${username}, ${email}, ${hashedPassword}) 
      RETURNING id, username, email
    `

    const user = result[0]
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET!, { expiresIn: "24h" })

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
