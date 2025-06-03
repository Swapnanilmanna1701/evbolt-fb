# 🚀 Vercel Deployment Guide

This guide will help you deploy the Charging Station Manager to Vercel using npm.

## 📋 Prerequisites

- GitHub account
- Vercel account
- Neon PostgreSQL database (or any PostgreSQL database)

## 🔧 Pre-Deployment Setup

### 1. Prepare Your Repository

\`\`\`bash
# Ensure you're using npm (not pnpm or yarn)
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml
npm install

# Test the build locally
npm run build

# Commit your changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
\`\`\`

### 2. Database Setup (Neon)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string
4. It should look like: \`postgresql://username:password@host/database?sslmode=require\`

## 🚀 Deployment Steps

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/charging-station-manager)

### Option 2: Manual Deployment

#### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "charging-station-manager"

#### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: \`npm run build\`
- **Output Directory**: \`.next\` (auto-detected)
- **Install Command**: \`npm install\`
- **Development Command**: \`npm run dev\`

#### Step 3: Environment Variables

Add these environment variables in Vercel:

\`\`\`env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
\`\`\`

**Important**: 
- Use a strong JWT secret (minimum 32 characters)
- Ensure DATABASE_URL includes \`?sslmode=require\`

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at \`https://your-app.vercel.app\`

## 🗄️ Post-Deployment Database Setup

After successful deployment, initialize your database:

\`\`\`bash
# Initialize database tables
curl -X POST https://your-app.vercel.app/api/init-db

# Verify tables were created
curl https://your-app.vercel.app/api/init-db
\`\`\`

## ✅ Verification Steps

### 1. Test API Health
\`\`\`bash
curl https://your-app.vercel.app/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "OK",
  "message": "Charging Station API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "dbConnected": true
}
\`\`\`

### 2. Test User Registration
\`\`\`bash
curl -X POST https://your-app.vercel.app/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

### 3. Test Frontend
Visit \`https://your-app.vercel.app\` and:
- Register a new account
- Login successfully
- Add a charging station
- View the map

## 🔧 Troubleshooting

### Build Failures

**Error: "Module not found"**
\`\`\`bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Error: "pnpm not found"**
- Ensure no \`pnpm-lock.yaml\` exists
- Check \`package.json\` has correct npm scripts
- Verify \`.npmrc\` is configured properly

### Database Connection Issues

**Error: "Database connection failed"**
1. Check DATABASE_URL format
2. Verify Neon database is active
3. Ensure SSL mode is enabled
4. Test connection locally first

**Error: "relation does not exist"**
\`\`\`bash
# Reinitialize database
curl -X POST https://your-app.vercel.app/api/init-db
\`\`\`

### Runtime Errors

**Error: "JWT_SECRET is required"**
- Verify environment variables in Vercel dashboard
- Ensure JWT_SECRET is at least 32 characters
- Redeploy after adding variables

**Error: "Function timeout"**
- Check Vercel function logs
- Optimize database queries
- Consider upgrading Vercel plan

## 📊 Monitoring

### Vercel Dashboard
- Monitor function invocations
- Check error rates
- Review performance metrics

### Database Monitoring
- Monitor connection count in Neon
- Check query performance
- Set up alerts for high usage

## 🔄 Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to your main branch:

\`\`\`bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys
\`\`\`

### Preview Deployments
Create preview deployments for feature branches:

\`\`\`bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel creates preview deployment
\`\`\`

## 🔒 Security Considerations

### Environment Variables
- Never commit secrets to git
- Use strong, unique JWT secrets
- Rotate secrets regularly

### Database Security
- Use SSL connections
- Limit database user permissions
- Monitor for suspicious activity

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only

## 📈 Performance Optimization

### Database
- Use connection pooling (already configured)
- Add database indexes for frequently queried fields
- Monitor slow queries

### Frontend
- Optimize images
- Use Next.js Image component
- Implement proper caching

### API
- Implement response caching
- Use database query optimization
- Monitor function execution time

## 🆘 Getting Help

If you encounter issues:

1. Check Vercel function logs
2. Review Neon database logs
3. Test API endpoints individually
4. Create an issue with detailed error information

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Project Issues](https://github.com/your-username/charging-station-manager/issues)
