#!/bin/bash

echo "🔍 Pre-deployment checks for Charging Station Manager"

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v1[8-9]\. ]] && [[ ! "$NODE_VERSION" =~ ^v[2-9][0-9]\. ]]; then
    echo "❌ Node.js 18+ required. Current: $NODE_VERSION"
    exit 1
fi

# Check npm version
echo "Checking npm version..."
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"

# Remove other package manager files
echo "Cleaning up package manager files..."
rm -f yarn.lock pnpm-lock.yaml

# Check if package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo "📦 Installing dependencies with npm..."
    npm install
fi

# Check for required environment variables
echo "Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET not set"
fi

# Test build
echo "Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check for Vercel configuration
if [ -f "vercel.json" ]; then
    echo "✅ Vercel configuration found"
else
    echo "⚠️  vercel.json not found"
fi

echo "🚀 Ready for deployment!"
