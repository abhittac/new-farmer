# 🚀 Deployment Guide - Harvest Direct E-commerce Platform

## 📋 Project Structure Overview
```
harvest-direct/
├── client/                 # React frontend (Vite + TypeScript)
├── server/                 # Express backend with API routes
├── shared/                 # Shared types and database schema
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
├── render.yaml             # Render deployment config
├── vercel.json             # Vercel deployment config
└── drizzle.config.ts       # Database configuration
```

## 🌟 OPTION 1: RENDER (Recommended - Full Stack Support)

### Why Choose Render?
- ✅ Full-stack application support
- ✅ Free PostgreSQL database
- ✅ Easy environment variable management
- ✅ Automatic SSL certificates
- ✅ Simple deployment process

### Step-by-Step Render Deployment:

#### 1. Prepare Your Repository
1. Create a GitHub repository
2. Push your entire project to GitHub
3. Ensure all files are committed including:
   - `render.yaml`
   - `package.json`
   - `.env.example` (not .env - we'll set variables in Render)

#### 2. Create Render Account
1. Visit [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

#### 3. Deploy Database First
1. Dashboard → "New +" → "PostgreSQL"
2. Settings:
   - **Name**: `harvest-direct-database`
   - **Database**: `harvest_direct`
   - **User**: `harvest_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (suitable for development/small scale)
3. Click "Create Database"
4. **IMPORTANT**: Copy the connection string - you'll need it

#### 4. Deploy Web Service
1. Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configuration:
   - **Name**: `harvest-direct-app`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
   - **Auto-Deploy**: Yes

#### 5. Configure Environment Variables
In your web service settings, add these variables:

```env
NODE_ENV=production
DATABASE_URL=[Your Render PostgreSQL connection string from step 3]
JWT_SECRET=harvest_direct_super_secret_jwt_key_for_production_2024
RAZORPAY_KEY_ID=[Your Razorpay Test/Live Key ID]
RAZORPAY_KEY_SECRET=[Your Razorpay Test/Live Secret Key]
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your_secure_admin_password
```

#### 6. Initialize Database
After successful deployment:
1. Go to your service → "Shell"
2. Run: `npm run db:push`
3. This will create all database tables

#### 7. Access Your App
- Your app will be available at: `https://harvest-direct-app.onrender.com`
- Admin panel: `https://harvest-direct-app.onrender.com/admin`

---

## 🔵 OPTION 2: VERCEL (Frontend Focus + Serverless Backend)

### Why Choose Vercel?
- ⚡ Ultra-fast frontend deployment
- 🌐 Global CDN
- 🔧 Serverless functions for API
- 📱 Excellent for React applications

### Step-by-Step Vercel Deployment:

#### 1. Prepare for Vercel
You'll need an external database since Vercel doesn't provide PostgreSQL:
- **Option A**: Use Neon (recommended) - free PostgreSQL
- **Option B**: Use Supabase - free PostgreSQL
- **Option C**: Use Railway - PostgreSQL hosting

#### 2. Setup External Database (Using Neon)
1. Visit [neon.tech](https://neon.tech)
2. Create account → "Create Project"
3. Choose region and create database
4. Copy the connection string

#### 3. Deploy to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. "New Project" → Import your repository
4. Vercel will auto-detect the configuration

#### 4. Configure Environment Variables
In Vercel project settings:
```env
NODE_ENV=production
DATABASE_URL=[Your Neon/Supabase connection string]
JWT_SECRET=harvest_direct_super_secret_jwt_key_for_production_2024
RAZORPAY_KEY_ID=[Your Razorpay Key ID]
RAZORPAY_KEY_SECRET=[Your Razorpay Secret Key]
```

#### 5. Deploy and Test
- Vercel will automatically deploy
- Your app will be at: `https://your-project-name.vercel.app`

---

## 🔑 Required API Keys & Secrets

### Razorpay Payment Gateway
1. Visit [razorpay.com](https://razorpay.com)
2. Create account → Dashboard
3. Settings → API Keys
4. Generate Test Keys (for development)
5. Generate Live Keys (for production)

### Environment Variables You Need:
```env
# Database (provided by hosting platform)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your_super_secret_key_minimum_32_characters

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Admin Access
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your_secure_password
```

---

## 🔍 Post-Deployment Checklist

### Test These Features:
- [ ] Homepage loads correctly
- [ ] Product catalog displays
- [ ] User registration/login
- [ ] Shopping cart functionality
- [ ] Payment processing (Razorpay)
- [ ] Admin panel access
- [ ] Farmer management (admin)
- [ ] Order management (admin)
- [ ] Database connectivity

### Performance Optimization:
- [ ] Images are optimized
- [ ] Database queries are efficient
- [ ] Environment variables are secure
- [ ] SSL certificate is active
- [ ] CDN is working (if using Vercel)

---

## 🆘 Troubleshooting Common Issues

### Database Connection Issues
```bash
# Test database connection
npm run db:push
```

### Environment Variables Not Loading
- Ensure variables are set in hosting platform
- Restart the service after adding variables
- Check variable names match exactly

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Review build logs for specific errors

### Admin Panel Access
- Verify admin credentials in environment variables
- Check JWT_SECRET is properly set
- Ensure database tables are created

---

## 📞 Need Help?

If you encounter issues during deployment:
1. Check the hosting platform logs
2. Verify all environment variables are set correctly
3. Ensure your Razorpay keys are active
4. Test database connectivity

Your comprehensive e-commerce platform is ready for the world! 🎉