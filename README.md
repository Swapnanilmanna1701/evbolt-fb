# Charging Station Manager

A full-stack application for managing electric vehicle charging stations built with Node.js, Express, PostgreSQL, and Next.js.

## Features

### Backend (Node.js + Express)
- **REST API** with full CRUD operations for charging stations
- **JWT Authentication** with user registration and login
- **PostgreSQL Database** with proper schema design
- **Protected Routes** requiring authentication
- **Input validation** and error handling
- **CORS enabled** for frontend integration

### Frontend (Next.js + React)
- **Modern UI** built with shadcn/ui components
- **Responsive design** that works on all devices
- **Real-time updates** after CRUD operations
- **Form validation** and user feedback
- **Authentication flow** with persistent sessions
- **Interactive dashboard** for managing stations

### Database Schema

#### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- created_at

#### Charging Stations Table
- id (Primary Key)
- name
- latitude/longitude (Location coordinates)
- address
- connector_type (Type 1, Type 2, CCS, CHAdeMO, Tesla)
- power_output (kW)
- status (available, occupied, maintenance)
- price_per_kwh
- created_by (Foreign Key to Users)
- created_at/updated_at

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Charging Stations (Protected Routes)
- `GET /api/charging-stations` - List all stations
- `GET /api/charging-stations/:id` - Get single station
- `POST /api/charging-stations` - Create new station
- `PUT /api/charging-stations/:id` - Update station
- `DELETE /api/charging-stations/:id` - Delete station

### Health Check
- `GET /api/health` - Server health status

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm (comes with Node.js)

### Backend Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Database Setup:**
   - Create a PostgreSQL database named `charging_stations`
   - Update the `DATABASE_URL` in your environment variables

3. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update the database connection string
   - Set a strong JWT secret

4. **Start the server:**
   \`\`\`bash
   npm run dev
   \`\`\`

The backend will run on `http://localhost:3001`

### Frontend Setup

The frontend is integrated into the same project. To run the development server:

\`\`\`bash
npm run dev
\`\`\`

The frontend will run on `http://localhost:3000`

### Database Initialization

The application automatically creates the required tables on startup:
- `users` table for authentication
- `charging_stations` table for station data

## Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with automatic CI/CD

### Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds

### Docker
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
\`\`\`

## Environment Variables for Production

\`\`\`env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
PORT=3001
\`\`\`

## Security Features

- **Password Hashing** with bcrypt
- **JWT Token Authentication** with expiration
- **Input Validation** on all endpoints
- **SQL Injection Protection** with parameterized queries
- **CORS Configuration** for secure cross-origin requests

## Testing the API

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

You can test the API endpoints using tools like Postman or curl:

\`\`\`bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create a charging station (replace TOKEN with actual JWT)
curl -X POST http://localhost:3001/api/charging-stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Downtown Station","latitude":40.7128,"longitude":-74.0060,"address":"123 Main St","connector_type":"Type 2","power_output":50,"status":"available","price_per_kwh":0.25}'
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.
