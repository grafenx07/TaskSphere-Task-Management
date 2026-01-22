# TaskSphere – Secure Task Management Platform

A production-grade, full-stack task management application built with modern web technologies, featuring secure JWT authentication, role-based access control, and a responsive user interface.

## 🚀 Project Overview

TaskSphere is a secure task management platform that allows users to create, organize, and track their tasks efficiently. The application implements industry-standard security practices including JWT-based authentication with refresh tokens, password hashing with bcrypt, and httpOnly cookies for secure token storage.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access + Refresh Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, express-rate-limit
- **Architecture**: Clean Architecture (Domain/Application/Infrastructure layers)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Database Migration**: Prisma Migrate
- **Environment**: dotenv

## 📁 Architecture

### Backend Structure
```
backend/
├── src/
│   ├── application/
│   │   └── interfaces/          # DTOs and interfaces
│   ├── domain/                   # Business entities
│   ├── infrastructure/
│   │   ├── auth/                 # Authentication service
│   │   ├── task/                 # Task service
│   │   ├── config/               # Environment configuration
│   │   ├── database/             # Prisma client setup
│   │   ├── http/
│   │   │   ├── controllers/     # Request handlers
│   │   │   ├── middlewares/     # Auth, error handling
│   │   │   └── routes/          # API routes
│   │   └── validation/          # Zod schemas
│   ├── app.ts                   # Express app configuration
│   └── server.ts                # Application entry point
└── prisma/
    ├── schema.prisma            # Database schema
    └── migrations/              # Database migrations
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── api-client.ts       # Axios instance with interceptors
│   │   ├── auth-context.tsx    # Authentication state
│   │   └── utils.ts            # Utility functions
│   ├── types/                  # TypeScript interfaces
│   └── styles/                 # Global styles
```

## 🔐 Security Features

1. **JWT Authentication**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Automatic token refresh via Axios interceptors

2. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - Password requirements: 8+ characters, uppercase, lowercase, number

3. **Cookie Security**
   - httpOnly cookies prevent XSS attacks
   - Secure flag in production (HTTPS only)
   - SameSite attribute prevents CSRF attacks
   - Path restriction on refresh token cookies

4. **Request Security**
   - Helmet.js for HTTP headers
   - CORS configuration with credentials
   - Rate limiting (100 requests per 15 minutes)
   - Input validation with Zod schemas

5. **Data Isolation**
   - Tasks scoped to authenticated user only
   - Owner verification on all update/delete operations

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    - Register new user
POST   /api/v1/auth/login       - Login user
POST   /api/v1/auth/refresh     - Refresh access token
POST   /api/v1/auth/logout      - Logout user (clear cookies)
GET    /api/v1/auth/me          - Get current user profile
```

### Tasks
```
POST   /api/v1/tasks                 - Create task
GET    /api/v1/tasks                 - List tasks (with filters)
GET    /api/v1/tasks/stats           - Get task statistics
GET    /api/v1/tasks/:id             - Get single task
PATCH  /api/v1/tasks/:id             - Update task
PATCH  /api/v1/tasks/:id/toggle      - Toggle task status
DELETE /api/v1/tasks/:id             - Delete task
```

### Query Parameters for Task List
- `status` - Filter by status (TODO, IN_PROGRESS, COMPLETED, ARCHIVED)
- `search` - Search in title and description
- `priority` - Filter by priority (0-10)
- `sortBy` - Sort by field (createdAt, dueDate, priority, title)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Strong secret key for access tokens
   - `JWT_REFRESH_SECRET` - Strong secret key for refresh tokens
   - `CORS_ORIGIN` - Frontend URL (default: http://localhost:3000)

4. **Setup database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start backend server**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   The default API URL is `http://localhost:5000/api/v1`

4. **Start frontend server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📝 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Access token secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

### Frontend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |

## 🎯 Features

### Authentication
- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Automatic token refresh
- ✅ Logout with cookie clearing
- ✅ Protected routes

### Task Management
- ✅ Create tasks with title, description, priority, due date
- ✅ View all tasks with pagination
- ✅ Search tasks by title/description
- ✅ Filter by status (TODO, IN_PROGRESS, COMPLETED, ARCHIVED)
- ✅ Sort by multiple fields
- ✅ Update task details
- ✅ Toggle task status (TODO → IN_PROGRESS → COMPLETED)
- ✅ Delete tasks
- ✅ Task statistics dashboard
- ✅ Overdue task tracking
- ✅ Auto-set completion timestamp

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Toast notifications for all actions
- ✅ Loading states and error handling
- ✅ Modal dialogs for create/edit
- ✅ Clean, modern interface
- ✅ Gradient backgrounds
- ✅ Icon-based actions

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Update `DATABASE_URL` to production database
3. Generate strong secrets for JWT keys
4. Enable HTTPS
5. Configure reverse proxy (nginx)
6. Run database migrations: `npx prisma migrate deploy`

### Frontend
1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Build: `npm run build`
3. Start: `npm start`
4. Or deploy to Vercel/Netlify

### Security Checklist for Production
- [ ] Strong JWT secrets (64+ characters)
- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] Database credentials secured
- [ ] CORS origin restricted to production domain
- [ ] Rate limiting configured
- [ ] Error messages sanitized (no stack traces)

## 🔄 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}
```

### Task Model
```prisma
model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Int        @default(0)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 📚 API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "accessToken": "..."
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔮 Future Improvements

### High Priority
- [ ] Email verification for new accounts
- [ ] Password reset functionality
- [ ] Task categories/tags
- [ ] Task attachments
- [ ] Collaborative tasks (task sharing)

### Medium Priority
- [ ] Redis-based token blacklisting for immediate logout
- [ ] Task reminders/notifications
- [ ] Calendar view for tasks
- [ ] Task templates
- [ ] Bulk task operations

### Low Priority
- [ ] Dark mode theme
- [ ] Export tasks (CSV, PDF)
- [ ] Task analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Integration with third-party services (Google Calendar, Slack)

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for secure task management**

