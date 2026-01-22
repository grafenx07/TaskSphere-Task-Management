# TaskSphere Deployment - Quick Start

## 🎯 Deploy in 3 Steps

### Step 1: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select **"TaskSphere-Task-Management"**
4. Add **"New Service"** → **"Database"** → **"PostgreSQL"**
5. Configure backend service:
   - Root directory: `backend`
   - Start command: `npm run start:prod`

6. Add environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.vercel.app
   JWT_SECRET=your_generated_secret_here
   REFRESH_TOKEN_SECRET=your_generated_refresh_secret_here
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

7. Copy your Railway backend URL: `https://YOUR_APP.railway.app`

### Step 2: Deploy Frontend (Vercel)

Option A: **Via Dashboard** (Easiest)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `TaskSphere-Task-Management`
3. Configure:
   - **Root Directory**: `frontend`
   - Framework: Next.js (auto-detected)
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL.railway.app/api/v1
   ```
5. Click **Deploy**

Option B: **Via CLI** (Current Directory)
```bash
cd frontend
vercel
```

### Step 3: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Register a new account
3. Create a task
4. Verify everything works!

---

## 🔑 Generate Secrets

**Windows PowerShell:**
```powershell
# Run this twice for two different secrets
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Git Bash / Mac / Linux:**
```bash
openssl rand -base64 32
```

---

## 📋 Deployment URLs Template

After deployment, save these:

```
Frontend (Vercel): https://_____________________.vercel.app
Backend (Railway): https://_____________________.railway.app
Database: Managed by Railway
```

---

## ⚡ Current Status

✅ Code pushed to GitHub
✅ Deployment configuration added
✅ Vercel CLI installed
✅ Ready to deploy!

**Next**: Choose deployment method and follow steps above.

---

## 🆘 Need Help?

See detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
