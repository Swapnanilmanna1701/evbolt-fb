# Contributing to Charging Station Manager

## Development Setup

1. **Fork and clone the repository:**
   \`\`\`bash
   git clone https://github.com/your-username/charging-station-manager.git
   cd charging-station-manager
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Development Workflow

1. **Create a feature branch:**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make your changes and test:**
   \`\`\`bash
   npm run dev
   npm run lint
   \`\`\`

3. **Build and test:**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Commit and push:**
   \`\`\`bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature-name
   \`\`\`

5. **Create a Pull Request**

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## Testing

Run the application locally and test:
- User authentication (register/login)
- CRUD operations for charging stations
- Map functionality and filtering
- Real-time updates

## Deployment

The application is configured for Vercel deployment:

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
