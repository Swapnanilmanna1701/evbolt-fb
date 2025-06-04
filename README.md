# 🚗⚡ Charging Station Manager

A full-stack application for managing electric vehicle charging stations built with **Next.js**, **MongoDB Atlas**, and **TypeScript**.

## 🌟 Features

### 🔧 Backend (Next.js API Routes + MongoDB)
- **REST API** with full CRUD operations for charging stations
- **JWT Authentication** with user registration and login
- **MongoDB Atlas** with Mongoose ODM
- **Protected Routes** requiring authentication
- **Input validation** and error handling
- **CORS enabled** for frontend integration

### 🎨 Frontend (Next.js + React)
- **Modern UI** built with shadcn/ui components
- **Responsive design** that works on all devices
- **Real-time updates** after CRUD operations
- **Interactive map** with Leaflet integration
- **Advanced filtering** and location-based search
- **Authentication flow** with persistent sessions

### 🗄️ Database Schema (MongoDB)

#### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### Charging Stations Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String (required),
  latitude: Number (required, -90 to 90),
  longitude: Number (required, -180 to 180),
  address: String (optional),
  connectorType: String (enum: Type 1, Type 2, CCS, CHAdeMO, Tesla),
  powerOutput: Number (1-1000 kW),
  status: String (enum: available, occupied, maintenance),
  pricePerKwh: Number (0-10),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- MongoDB Atlas account

### 1. Clone & Install
\`\`\`bash
git clone <your-repo-url>
cd charging-station-manager
npm install
\`\`\`

`

### 3. Start Development
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

### 4. Initialize Database
Visit [http://localhost:3000/api/init-db](http://localhost:3000/api/init-db) or:
\`\`\`bash
curl -X POST http://localhost:3000/api/init-db
\`\`\`

## 🌐 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### ⚡ Charging Stations (Protected)
- `GET /api/charging-stations` - List all stations
- `GET /api/charging-stations/[id]` - Get single station
- `POST /api/charging-stations` - Create new station
- `PUT /api/charging-stations/[id]` - Update station
- `DELETE /api/charging-stations/[id]` - Delete station

### 🔍 Utility
- `GET /api/health` - Health check
- `POST /api/init-db` - Initialize database

## 🚀 Deployment to Vercel



### Deploy Steps
1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Initialize Production Database**
   \`\`\`bash
   curl -X POST https://your-app.vercel.app/api/init-db
   \`\`\`

## 🧪 Testing

### Test API Health
\`\`\`bash
curl https://your-app.vercel.app/api/health
\`\`\`

### Test User Registration
\`\`\`bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

### Test Login
\`\`\`bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

## 🛠️ Available Scripts

\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
\`\`\`

## 🏗️ Project Structure

\`\`\`
charging-station-manager/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── charging-stations/ # Station CRUD endpoints
│   │   ├── health/         # Health check
│   │   └── init-db/        # Database initialization
│   ├── components/         # React components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── lib/
│   ├── mongodb.ts         # MongoDB connection
│   └── auth.ts            # JWT utilities
├── models/
│   ├── User.ts            # User model
│   └── ChargingStation.ts # Station model
├── components/ui/         # shadcn/ui components
├── .env.local            # Environment variables
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies
└── vercel.json           # Vercel deployment config
\`\`\`

## 🔒 Security Features

- ✅ **Password Hashing** with bcrypt (salt rounds: 12)
- ✅ **JWT Authentication** with 30-day expiration
- ✅ **Input Validation** with Mongoose schemas
- ✅ **MongoDB Injection Protection** with parameterized queries
- ✅ **CORS Configuration** for secure cross-origin requests
- ✅ **Environment Variable Protection**

## 🎯 Key Features

### 🗺️ Interactive Map
- Real-time station markers with status colors
- Location-based search with radius filtering
- Geocoding integration for address search
- Google Maps directions integration

### 🔍 Advanced Filtering
- Filter by status (available, occupied, maintenance)
- Filter by connector type (Type 1, Type 2, CCS, CHAdeMO, Tesla)
- Filter by price range and power output
- Location-based filtering with customizable radius

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Verify your `MONGO_URI` is correct
- Check MongoDB Atlas network access settings
- Ensure your IP is whitelisted

**JWT Token Issues:**
- Verify `JWT_SECRET` is set and secure
- Check token expiration settings
- Clear browser localStorage if needed

**Build Errors:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### Getting Help

- Check the [Issues](https://github.com/your-username/charging-station-manager/issues) page
- Create a new issue with detailed information
- Include error messages and steps to reproduce

---

**Built with ❤️ using Next.js, MongoDB Atlas, and TypeScript**
\`\`\`

The application is now fully configured with **MongoDB Atlas** instead of PostgreSQL, using the exact environment variables you provided. All schemas have been converted to Mongoose models, and the authentication system is properly implemented with JWT tokens. Users can successfully register, login, and manage charging stations with full CRUD operations.
