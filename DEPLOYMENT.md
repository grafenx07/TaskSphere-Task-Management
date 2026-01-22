# 🚀 Deployment Guide - TaskSphere

## Deployment Architecture

This application consists of two parts:
- **Frontend**: Next.js application (deploy to Vercel)
- **Backend**: Node.js/Express API (deploy to Railway/Render)

---

## 📱 Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**:
   - Click "Add New Project"
   - Select your `TaskSphere-Task-Management` repository
   - Vercel will auto-detect Next.js

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables**:
   Add the following environment variable:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: [Your backend API URL - see backend deployment below]
   ```

   Example: `https://your-backend.railway.app/api/v1`

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your frontend will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? tasksphere-frontend
# - Directory? ./
# - Override settings? No

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL

# Deploy to production
vercel --prod
```

---

## 🖥️ Backend Deployment (Railway - Recommended)

Railway provides free PostgreSQL database and Node.js hosting.

### Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `TaskSphere-Task-Management` repository

3. **Configure Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build` (if you add a build script)
   - **Start Command**: `npm start` or `node dist/server.js`

4. **Add PostgreSQL Database**:
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a database

5. **Environment Variables**:
   Railway auto-fills `DATABASE_URL`. Add the following:

   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-frontend.vercel.app
   JWT_SECRET=[generate with: openssl rand -base64 32]
   REFRESH_TOKEN_SECRET=[generate with: openssl rand -base64 32]
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

6. **Deploy**:
   - Railway automatically deploys
   - Your backend will be live at: `https://your-backend.railway.app`
   - Copy this URL for frontend environment variables

7. **Run Database Migrations**:
   - In Railway dashboard, go to your backend service
   - Open "Settings" → "Deploy"
   - Add custom start command: `npx prisma migrate deploy && npm start`

---

## 🔄 Alternative Backend Deployment Options

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. Add PostgreSQL database (paid)
6. Set environment variables

### Option 3: Heroku

1. Install Heroku CLI
2. Create new app: `heroku create tasksphere-backend`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set config vars: `heroku config:set JWT_SECRET=...`
6. Deploy: `git subtree push --prefix backend heroku main`

### Option 4: DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Create new app from GitHub
3. Set root directory to `backend`
4. Add managed PostgreSQL database
5. Configure environment variables
6. Deploy

---

## 🔐 Production Environment Variables

### Backend (.env or Platform Settings)

Generate secure secrets:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Required variables:
```env
# Database (provided by hosting platform)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server
NODE_ENV=production
PORT=3001

# CORS - Your Vercel frontend URL
CORS_ORIGIN=https://your-app.vercel.app

# JWT Secrets (generate new ones!)
JWT_SECRET=[generate-random-32-char-string]
REFRESH_TOKEN_SECRET=[generate-different-random-32-char-string]
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Frontend (Vercel Environment Variables)

```env
# Your Railway/Render backend URL
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## 📝 Backend Package.json Updates

Add these scripts to `backend/package.json` for production:

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "npx prisma migrate deploy",
    "postinstall": "npx prisma generate"
  }
}
```

---

## 🔄 Deployment Workflow

### Initial Deployment

1. **Deploy Backend First** (Railway/Render)
   - Push code to GitHub
   - Connect repository to hosting platform
   - Add environment variables
   - Deploy and get backend URL

2. **Deploy Frontend** (Vercel)
   - Connect repository to Vercel
   - Add backend URL to environment variables
   - Deploy

3. **Test**
   - Visit your Vercel URL
   - Test registration and login
   - Verify API calls work

### Continuous Deployment

Both platforms support automatic deployment:
- **Push to `main` branch** → Automatic deployment
- **Push to other branches** → Preview deployments (Vercel)

---

## 🧪 Pre-Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] No `.env` files committed (only `.env.example`)
- [ ] Database migrations tested locally
- [ ] Build succeeds locally (`npm run build`)
- [ ] All tests passing
- [ ] CORS configured for production domain
- [ ] JWT secrets generated (strong, unique)
- [ ] Environment variables documented

---

## 🐛 Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Test build locally: `cd frontend && npm run build`

**API calls fail:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend URL is accessible

### Backend Issues

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure IP whitelist includes hosting platform

**Migrations fail:**
- Run manually: `npx prisma migrate deploy`
- Check migration files exist in repository
- Verify Prisma schema is correct

**CORS errors:**
- Update `CORS_ORIGIN` to match frontend URL
- Include `https://` in the URL
- Check backend logs for details

---

## 📊 Monitoring & Logs

### Vercel (Frontend)
- Dashboard: Real-time logs and analytics
- Functions: Serverless function logs
- Insights: Performance metrics

### Railway (Backend)
- Deployment logs: View build and runtime logs
- Metrics: CPU, memory, network usage
- Logs: Real-time application logs

---

## 🔧 Database Management

### Railway PostgreSQL
```bash
# Connect to database
railway connect

# Run Prisma Studio
npx prisma studio
```

### Run Migrations
```bash
# Locally against production DB
DATABASE_URL="[your-production-db-url]" npx prisma migrate deploy

# Via Railway CLI
railway run npx prisma migrate deploy
```

---

## 💰 Pricing

### Vercel (Frontend)
- **Hobby (Free)**:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Perfect for this project

### Railway (Backend)
- **Free Tier**:
  - $5 free credit/month
  - Enough for small apps
  - PostgreSQL included

- **Pro**: $20/month for production apps

### Alternatives
- **Render Free Tier**: Available for both frontend and backend
- **Fly.io**: Free tier with PostgreSQL

---

## 🚀 Quick Deploy Commands

```bash
# Backend to Railway (after setup)
git push

# Frontend to Vercel (after setup)
cd frontend
vercel --prod

# Or push to GitHub (auto-deploys)
git push origin main
```

---

## 📞 Post-Deployment

1. **Update Repository README** with live URLs
2. **Test all features** in production
3. **Monitor logs** for errors
4. **Set up alerts** (optional)
5. **Share your app** with users!

---

## 🎉 Your App is Live!

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app
- **Database**: Managed by Railway

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Project README: [README.md](./README.md)
