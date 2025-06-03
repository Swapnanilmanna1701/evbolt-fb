#!/bin/bash

# Deployment script for Charging Station Manager
echo "Preparing for deployment..."

# Clean install
echo "Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Build the application
echo "Building application..."
npm run build

# Run tests if they exist
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "Running tests..."
    npm test
fi

echo "Build complete! Ready for deployment."
