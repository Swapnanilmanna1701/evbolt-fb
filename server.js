import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { Pool } from "pg"

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection (PostgreSQL) - Updated for Vercel deployment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test database connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("Database connection error:", err)
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Initialize database tables
async function initDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Charging stations table
    await pool.query(`
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
    `)

    console.log("Database tables initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword],
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" })

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Charging Station Routes

// GET all charging stations
app.get("/api/charging-stations", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cs.*, u.username as created_by_username 
      FROM charging_stations cs 
      LEFT JOIN users u ON cs.created_by = u.id 
      ORDER BY cs.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching charging stations:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET single charging station
app.get("/api/charging-stations/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `
      SELECT cs.*, u.username as created_by_username 
      FROM charging_stations cs 
      LEFT JOIN users u ON cs.created_by = u.id 
      WHERE cs.id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Charging station not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching charging station:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// CREATE charging station
app.post("/api/charging-stations", authenticateToken, async (req, res) => {
  try {
    const { name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh } = req.body

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: "Name, latitude, and longitude are required" })
    }

    const result = await pool.query(
      `
      INSERT INTO charging_stations 
      (name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        name,
        latitude,
        longitude,
        address,
        connector_type,
        power_output,
        status || "available",
        price_per_kwh,
        req.user.userId,
      ],
    )

    res.status(201).json({
      message: "Charging station created successfully",
      station: result.rows[0],
    })
  } catch (error) {
    console.error("Error creating charging station:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// UPDATE charging station
app.put("/api/charging-stations/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh } = req.body

    const result = await pool.query(
      `
      UPDATE charging_stations 
      SET name = $1, latitude = $2, longitude = $3, address = $4, 
          connector_type = $5, power_output = $6, status = $7, 
          price_per_kwh = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `,
      [name, latitude, longitude, address, connector_type, power_output, status, price_per_kwh, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Charging station not found" })
    }

    res.json({
      message: "Charging station updated successfully",
      station: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating charging station:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE charging station
app.delete("/api/charging-stations/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("DELETE FROM charging_stations WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Charging station not found" })
    }

    res.json({ message: "Charging station deleted successfully" })
  } catch (error) {
    console.error("Error deleting charging station:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Charging Station API is running" })
})

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/health`)
  })
})

export default app
