# Quick Start Guide

## 🚀 Installation Steps

### Step 1: Install Backend Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

**Installed packages:**
- express, cors, helmet, compression, morgan, cookie-parser
- typescript, @types/node, @types/express
- prisma, @prisma/client
- jsonwebtoken, @types/jsonwebtoken
- bcrypt, @types/bcrypt
- zod
- http-status-codes
- express-rate-limit
- dotenv
- nodemon, ts-node

### Step 2: Install Frontend Dependencies

\`\`\`bash
cd ../frontend
npm install
\`\`\`

**Installed packages:**
- next, react, react-dom
- typescript, @types/react, @types/node
- tailwindcss, postcss, autoprefixer
- axios
- react-hook-form, @hookform/resolvers
- zod
- sonner (toast notifications)
- lucide-react (icons)
- clsx

### Step 3: Setup Backend Environment

\`\`\`bash
cd ../backend
cp .env.example .env
\`\`\`

**Edit `.env` and configure:**
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/tasksphere_db"
JWT_SECRET="your-secret-key-at-least-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-at-least-32-characters"
CORS_ORIGIN="http://localhost:3000"
\`\`\`

### Step 4: Setup Database

\`\`\`bash
# Create database (PostgreSQL must be running)
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
\`\`\`

### Step 5: Setup Frontend Environment

\`\`\`bash
cd ../frontend
cp .env.example .env.local
\`\`\`

The default configuration should work:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
\`\`\`

### Step 6: Start Development Servers

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

## 🎯 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🧪 Test the Application

1. **Register a new account**
   - Go to http://localhost:3000
   - Click "Sign up"
   - Create an account

2. **Create a task**
   - After login, click "New Task"
   - Fill in task details
   - Save

3. **Test features**
   - Search tasks
   - Filter by status
   - Toggle task status
   - Edit task
   - Delete task

## 🔧 Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### CORS Errors
- Check CORS_ORIGIN in backend/.env
- Ensure it matches frontend URL (http://localhost:3000)

### Token Errors
- Clear browser cookies
- Logout and login again
- Check JWT secrets are set

### Port Already in Use
- Backend default: 5000 (change with PORT in .env)
- Frontend default: 3000 (Next.js auto-increments if busy)

## 📝 Default Credentials (after seeding)

If you run `npm run seed` in backend:
- Email: admin@example.com
- Password: Admin123!

## 🎉 You're All Set!

Your full-stack TaskSphere application is now running!
