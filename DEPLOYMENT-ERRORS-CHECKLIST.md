# 🚨 DEPLOYMENT ERROR PREVENTION CHECKLIST

## ❌ **CRITICAL ISSUES FIXED:**

### **1. Port Mismatch - RESOLVED ✅**
- ✅ Backend standardized to PORT=3001
- ✅ Frontend API client updated to match
- ✅ All .env.example files synchronized

### **2. Prisma Binary Targets - RESOLVED ✅**
- ✅ Added Railway-compatible Prisma binary target: `debian-openssl-3.0.x`

### **3. Production Security - RESOLVED ✅**
- ✅ Added JWT secret validation on startup
- ✅ Prevents deployment with weak/default secrets

---

## 🔍 **PRE-DEPLOYMENT CHECKLIST:**

### **RAILWAY BACKEND DEPLOYMENT:**

#### **Environment Variables (Railway Dashboard):**
```bash
# Required - MUST SET ALL OF THESE:
NODE_ENV=production
PORT=3001  # Railway auto-assigns, but set for consistency
DATABASE_URL=<auto-set-by-railway-postgres>

# JWT Secrets - GENERATE NEW ONES (PowerShell):
# Run: -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
JWT_SECRET=<32-char-random-string>
REFRESH_TOKEN_SECRET=<different-32-char-random-string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS - UPDATE AFTER VERCEL DEPLOYMENT:
CORS_ORIGIN=https://tasksphere.vercel.app
```

#### **Railway Service Settings:**
- ✅ Service Name: `tasksphere-backend`
- ✅ Root Directory: `backend`
- ✅ Build Command: `npm run railway:build` (handles migrations)
- ✅ Start Command: `node dist/server.js`
- ✅ PostgreSQL database added and linked

#### **Common Railway Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Prisma schema not found` | Wrong root directory | Set Root Directory to `backend` |
| `DATABASE_URL not defined` | PostgreSQL not linked | Add PostgreSQL service and link |
| `Binary target not found` | Missing Prisma binary | Already fixed in schema.prisma |
| `Migration failed` | No migrations created | Check `backend/prisma/migrations/` exists |
| `Build timeout` | Large dependencies | Normal for first build (3-5 min) |
| `Port already in use` | Railway auto-assigns | Use `process.env.PORT` (already configured) |

---

### **VERCEL FRONTEND DEPLOYMENT:**

#### **Environment Variables (Vercel Dashboard):**
```bash
# Required - SET THIS:
NEXT_PUBLIC_API_URL=https://tasksphere-backend-production.up.railway.app/api/v1
# ⚠️ Replace with your actual Railway backend URL
```

#### **Vercel Project Settings:**
- ✅ Project Name: `tasksphere`
- ✅ Framework: Next.js (auto-detected)
- ✅ Root Directory: `frontend`
- ✅ Build Command: `npm run build` (default)
- ✅ Output Directory: `.next` (default)
- ✅ Install Command: `npm install` (default)

#### **Common Vercel Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `NEXT_PUBLIC_API_URL undefined` | Env var not set | Add in Vercel dashboard → Redeploy |
| `Module not found` | Wrong root directory | Set Root Directory to `frontend` |
| `Build failed: lint errors` | ESLint warnings | Ignore or fix in dashboard.tsx line 70 |
| `API calls fail with CORS` | Backend CORS not updated | Update CORS_ORIGIN on Railway |
| `404 on API routes` | Wrong API URL | Verify Railway backend URL is correct |
| `Hydration error` | Client/server mismatch | Check useEffect dependencies (known warning) |

---

### **DATABASE (RAILWAY POSTGRESQL):**

#### **Automatic Configuration:**
- ✅ Railway auto-provisions PostgreSQL
- ✅ DATABASE_URL automatically injected
- ✅ Migrations run via `npx prisma migrate deploy`

#### **Common Database Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | DB not provisioned | Wait for Railway to fully provision DB (2-3 min) |
| `Migration failed` | No migration files | Run `npm run prisma:migrate` locally first |
| `Schema out of sync` | Migrations not deployed | Railway runs automatically on build |
| `Connection timeout` | Network issue | Check Railway DB service status |
| `SSL required` | Production DB security | Prisma handles automatically |

---

## 🚀 **DEPLOYMENT SEQUENCE:**

### **CORRECT ORDER (CRITICAL):**

1. **✅ Push Latest Code to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment configurations"
   git push origin main
   ```

2. **✅ Deploy Backend to Railway (FIRST)**
   - Create project from GitHub
   - Add PostgreSQL service
   - Configure environment variables
   - Wait for deployment ✅
   - **COPY BACKEND URL**

3. **✅ Update CORS_ORIGIN on Railway**
   - Set to: `https://tasksphere.vercel.app`
   - Or your custom Vercel domain

4. **✅ Deploy Frontend to Vercel (SECOND)**
   - Import from GitHub
   - Set root directory to `frontend`
   - Add `NEXT_PUBLIC_API_URL` with Railway backend URL
   - Deploy

5. **✅ Test Production**
   - Register new user
   - Login
   - Create task
   - Check browser console for errors

---

## ⚠️ **POST-DEPLOYMENT ISSUES:**

### **Backend deployed but frontend can't connect:**
```bash
# Check these:
1. NEXT_PUBLIC_API_URL in Vercel matches Railway backend URL
2. CORS_ORIGIN on Railway matches Vercel frontend URL
3. Railway backend health check passes: /health endpoint
4. Check browser console for CORS errors
```

### **Both deployed but authentication fails:**
```bash
# Check these:
1. JWT_SECRET and REFRESH_TOKEN_SECRET are set on Railway
2. Cookies enabled in browser
3. HTTPS used (Railway/Vercel auto-provide)
4. Check Railway logs for errors
```

### **Database connection errors:**
```bash
# Check these:
1. PostgreSQL service running on Railway
2. DATABASE_URL set (should be automatic)
3. Migrations deployed (check Railway build logs)
4. Check Railway DB service metrics
```

---

## 🔧 **DEBUGGING TOOLS:**

### **Railway:**
```bash
# View logs:
Railway Dashboard → tasksphere-backend → Deployments → Logs

# Check environment variables:
Railway Dashboard → tasksphere-backend → Variables

# View metrics:
Railway Dashboard → tasksphere-backend → Metrics

# Database access:
Railway Dashboard → tasksphere-db → Data
```

### **Vercel:**
```bash
# View logs:
Vercel Dashboard → tasksphere → Deployments → [Latest] → Function Logs

# Check environment:
Vercel Dashboard → tasksphere → Settings → Environment Variables

# Preview builds:
Each commit creates preview deployment
```

### **Local Testing:**
```bash
# Test backend health:
curl https://tasksphere-backend-production.up.railway.app/health

# Test frontend API connection:
Open browser console on Vercel site
Network tab → Check API calls

# Check CORS:
Look for "CORS policy" errors in console
```

---

## 📋 **FINAL VERIFICATION:**

Before considering deployment complete:

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without console errors
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can create task
- [ ] Can view tasks
- [ ] Can update task status
- [ ] Can delete task
- [ ] Tokens refresh automatically
- [ ] No CORS errors in browser
- [ ] All Railway services green
- [ ] Vercel deployment successful

---

## 🆘 **EMERGENCY ROLLBACK:**

If deployment fails catastrophically:

### **Railway:**
```bash
1. Go to Deployments tab
2. Click on last working deployment
3. Click "Redeploy"
```

### **Vercel:**
```bash
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
```

### **Database:**
```bash
# Railway keeps automatic backups
# Contact Railway support for restoration if needed
```

---

## 📞 **SUPPORT RESOURCES:**

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Last Updated:** After critical port mismatch fix
**Status:** Ready for deployment ✅
