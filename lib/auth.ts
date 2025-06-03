import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRE = process.env.JWT_EXPIRE || "30d"

export interface JWTPayload {
  userId: string
  username: string
  email: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.substring(7)
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
