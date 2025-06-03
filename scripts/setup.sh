#!/bin/bash

echo "🚀 Setting up Charging Station Manager"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    echo "Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Clean up other package managers
echo "🧹 Cleaning up package manager files..."
rm -f yarn.lock pnpm-lock.yaml

# Install dependencies
echo "📦 Installing dependencies with npm..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Database Configuration
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Environment
NODE_ENV=development
EOL
    echo "⚠️  Please edit .env.local with your actual database credentials"
fi

# Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo "4. Initialize database by visiting http://localhost:3000/api/init-db"
echo ""
echo "For deployment to Vercel:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Deploy!"
