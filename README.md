# Charging Station Manager

A full-stack application for managing electric vehicle charging stations built with Next.js, PostgreSQL, and TypeScript.

## 🚀 Features

### Backend (Next.js API Routes)
- **REST API** with full CRUD operations for charging stations
- **JWT Authentication** with user registration and login
- **PostgreSQL Database** with Neon serverless driver
- **Protected Routes** requiring authentication
- **Input validation** and error handling
- **CORS enabled** for frontend integration

### Frontend (Next.js + React)
- **Modern UI** built with shadcn/ui components
- **Responsive design** that works on all devices
- **Real-time updates** after CRUD operations
- **Interactive map** with Leaflet integration
- **Advanced filtering** and location-based search
- **Authentication flow** with persistent sessions

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- PostgreSQL database (Neon recommended)

## 🛠️ Installation

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd charging-station-manager
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a \`.env.local\` file in the root directory:

\`\`\`env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
\`\`\`

### 4. Initialize Database
\`\`\`bash
# Start the development server
npm run dev

# In another terminal, initialize the database
curl -X POST http://localhost:3000/api/init-db
\`\`\`

### 5. Start Development
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment to Vercel

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/charging-station-manager)

### Manual Deployment

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

3. **Environment Variables in Vercel**
   Add these in your Vercel project settings:
   \`\`\`
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   \`\`\`

4. **Deploy**
   Vercel will automatically deploy your application.

5. **Initialize Database**
   After deployment, visit:
   \`\`\`
   https://your-app.vercel.app/api/init-db
   \`\`\`

## 📚 API Documentation

### Authentication Endpoints
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login

### Charging Station Endpoints
- \`GET /api/charging-stations\` - List all stations
- \`GET /api/charging-stations/[id]\` - Get single station
- \`POST /api/charging-stations\` - Create new station
- \`PUT /api/charging-stations/[id]\` - Update station
- \`DELETE /api/charging-stations/[id]\` - Delete station

### Utility Endpoints
- \`GET /api/health\` - Health check
- \`POST /api/init-db\` - Initialize database tables

## 🧪 Testing

\`\`\`bash
# Test API health
curl https://your-app.vercel.app/api/health

# Register a user
curl -X POST https://your-app.vercel.app/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123"}'
\`\`\`

## 🔧 Available Scripts

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
│   ├── components/          # React components
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/ui/          # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── public/                 # Static assets
├── .env.local             # Environment variables
├── next.config.mjs        # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── vercel.json           # Vercel deployment configuration
\`\`\`

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection
- Input validation
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify your \`DATABASE_URL\` is correct
- Ensure your Neon database is active
- Check SSL settings in connection string

**Build Errors:**
- Clear npm cache: \`npm cache clean --force\`
- Delete node_modules: \`rm -rf node_modules package-lock.json\`
- Reinstall: \`npm install\`

**Deployment Issues:**
- Check Vercel function logs
- Verify environment variables are set
- Ensure Node.js version compatibility

### Getting Help

- Check the [Issues](https://github.com/your-username/charging-station-manager/issues) page
- Create a new issue with detailed information
- Include error messages and steps to reproduce
\`\`\`
