# 🚀 Separate Frontend & Backend Deployment Guide

## 📋 When to Use Separate Deployments:
- Want frontend on Vercel/Netlify (faster)
- Backend on Railway/Render (database support)
- Team working on different parts
- Different scaling requirements

## 🔧 Step 1: Prepare Backend Repository

### Create New Backend Folder Structure:
```
harvest-direct-backend/
├── server/
├── shared/
├── package.json (backend only)
├── .env
└── drizzle.config.ts
```

### Backend package.json:
```json
{
  "name": "harvest-direct-backend",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    // Only backend dependencies
    "express": "^4.21.2",
    "drizzle-orm": "^0.39.1",
    "@neondatabase/serverless": "^0.10.4",
    // ... other backend deps
  }
}
```

## 🎨 Step 2: Prepare Frontend Repository

### Create New Frontend Folder Structure:
```
harvest-direct-frontend/
├── src/
├── public/
├── package.json (frontend only)
├── vite.config.ts
└── index.html
```

### Frontend package.json:
```json
{
  "name": "harvest-direct-frontend",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    // Only frontend dependencies
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tanstack/react-query": "^5.60.5",
    // ... other frontend deps
  }
}
```

## 🚀 Step 3: Deploy Backend

### Option A: Render (Recommended)
1. Create new repository for backend
2. Deploy to Render with PostgreSQL
3. Note your API URL: `https://your-api.onrender.com`

### Option B: Railway
1. Push backend to GitHub
2. Deploy on Railway
3. Add PostgreSQL addon

## 🌐 Step 4: Deploy Frontend

### Option A: Vercel (Recommended)
1. Create new repository for frontend
2. Add environment variable:
   ```
   VITE_API_URL=https://your-api.onrender.com
   ```
3. Deploy to Vercel

### Option B: Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

## 🔧 Step 5: Update Frontend API Calls

Update your API base URL in frontend:
```typescript
// In your API client
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Update all fetch calls
fetch(`${API_BASE}/api/products`)
```

## 📝 Step 6: Handle CORS

Update backend server for cross-origin requests:
```typescript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

## ✅ Benefits of Separate Deployment:
- ⚡ Faster frontend (CDN)
- 🔧 Independent scaling
- 👥 Team can work separately
- 🛠️ Different tech stacks possible

## ❌ Drawbacks:
- 🔧 More complex setup
- 🌐 CORS configuration needed
- 📱 Two repositories to maintain
- 💰 Potentially higher costs