# Deployment Guide for Vercel

## Quick Deployment Steps

### 1. Database Setup (Neon PostgreSQL)
Since you have Neon integration available, create your PostgreSQL database:

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Add the Neon integration
4. Copy the connection string to your `DATABASE_URL` environment variable

### 2. Environment Variables
Make sure these are set in your Vercel project:

\`\`\`env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
\`\`\`

### 3. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push

#### Option B: Vercel CLI
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts to configure your project
\`\`\`

### 4. Post-Deployment Setup

After deployment, your app will be available at your Vercel URL. The database tables will be automatically created on first startup.

#### Test Your Deployment
1. Visit `https://your-app.vercel.app/api/health` to check if the API is running
2. Visit `https://your-app.vercel.app` to access the frontend
3. Register a new user account
4. Start adding charging stations!

### 5. Custom Domain (Optional)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

## Troubleshooting

### Common Issues:

**Database Connection Errors:**
- Ensure `DATABASE_URL` is correctly set
- Check that your Neon database is active
- Verify SSL settings in connection string

**JWT Token Issues:**
- Make sure `JWT_SECRET` is set and is a strong random string
- Check that the secret is the same across all deployments

**CORS Errors:**
- The app is configured to handle CORS automatically
- If issues persist, check the frontend API URL configuration

### Monitoring
- Check Vercel function logs in your dashboard
- Monitor database connections in Neon dashboard
- Use Vercel Analytics for performance insights

## Production Considerations

1. **Security:**
   - Use strong, unique JWT secrets
   - Enable database SSL in production
   - Consider rate limiting for API endpoints

2. **Performance:**
   - Database connection pooling is configured
   - Consider adding Redis for session storage at scale
   - Monitor API response times

3. **Backup:**
   - Neon provides automatic backups
   - Consider additional backup strategies for critical data

## Scaling
- Vercel automatically scales your functions
- Monitor database connection limits
- Consider upgrading Neon plan for higher traffic

### Local Development Setup

1. **Clone and install:**
   \`\`\`bash
   git clone <your-repo>
   cd charging-station-manager
   npm install
   \`\`\`

2. **Environment setup:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

3. **Start development:**
   \`\`\`bash
   npm run dev
   \`\`\`

### Build Commands

\`\`\`bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
