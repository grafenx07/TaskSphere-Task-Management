# Authentication Module

## Overview

A complete JWT-based authentication system with access tokens, refresh tokens, and bcrypt password hashing.

## Features

- ✅ User registration with email validation
- ✅ User login with credential verification
- ✅ JWT access tokens (short-lived)
- ✅ JWT refresh tokens (long-lived)
- ✅ Token refresh mechanism
- ✅ Password hashing with bcrypt
- ✅ Role-based authorization
- ✅ Protected routes middleware
- ✅ Input validation

## API Endpoints

### Public Routes

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Protected Routes

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-01-21T00:00:00.000Z",
      "updatedAt": "2026-01-21T00:00:00.000Z"
    }
  }
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

## Usage Examples

### Protecting Routes

```typescript
import { authenticate, authorize } from '@infrastructure/http/middlewares/auth.middleware';

// Require authentication
router.get('/profile', authenticate, controller.getProfile);

// Require specific role
router.delete('/users/:id', authenticate, authorize('ADMIN'), controller.deleteUser);

// Multiple roles allowed
router.post('/tasks', authenticate, authorize('USER', 'ADMIN'), controller.createTask);
```

### Optional Authentication

```typescript
import { optionalAuthenticate } from '@infrastructure/http/middlewares/auth.middleware';

// Attach user if authenticated, but don't require it
router.get('/public-data', optionalAuthenticate, controller.getPublicData);
```

### Accessing User in Controllers

```typescript
import { Request, Response } from 'express';

export const someController = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;
  const userRole = req.user!.role;

  // Your logic here
};
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Token Configuration

Configured in `.env`:

```env
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="30d"
```

**Recommendations:**
- Access Token: 15m - 1h for production
- Refresh Token: 7d - 30d for production

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Separate secrets for access and refresh tokens
- Email validation
- Strong password requirements
- Account activation status checking
- Token verification on protected routes

## Error Handling

All authentication errors return appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials, expired tokens)
- `403` - Forbidden (insufficient permissions, deactivated account)
- `409` - Conflict (email already exists)

## Architecture

```
infrastructure/
├── auth/
│   └── auth.service.ts        # Business logic
├── http/
│   ├── controllers/
│   │   └── auth.controller.ts # HTTP handlers
│   ├── middlewares/
│   │   └── auth.middleware.ts # JWT verification
│   └── routes/
│       └── auth.routes.ts     # Route definitions
└── validation/
    └── auth.validation.ts     # Input validation

application/
└── interfaces/
    └── auth.interface.ts      # TypeScript interfaces
```

## Testing

Test credentials (after running seed):
- Admin: `admin@tasksphere.com` / `password123`
- User: `user@tasksphere.com` / `password123`
