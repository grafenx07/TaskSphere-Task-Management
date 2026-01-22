# POST /auth/login Implementation Guide

## Endpoint Details

```
POST /api/v1/auth/login
Content-Type: application/json
```

## Features Implemented

### ✅ Credential Validation

**Validates:**
- Email format and existence
- Password correctness using bcrypt comparison
- Account active status

**Process:**
1. Find user by email
2. Check if account is active
3. Compare password hash using bcrypt
4. Return error if any validation fails

### ✅ Access Token Generation (15 minutes)

**Configuration:**
- Expiration: 15 minutes
- Algorithm: HS256 (HMAC with SHA-256)
- Payload: userId, email, role
- Secret: JWT_SECRET environment variable

**Location:** Returned in response body

### ✅ Refresh Token Generation (7 days)

**Configuration:**
- Expiration: 7 days
- Algorithm: HS256 (HMAC with SHA-256)
- Payload: userId, email, role
- Secret: REFRESH_TOKEN_SECRET environment variable

**Location:** Stored in httpOnly cookie

### ✅ Secure Cookie Storage

**Cookie Configuration:**
- Name: `refreshToken`
- httpOnly: `true` (prevents JavaScript access)
- secure: `true` in production (HTTPS only)
- sameSite: `strict` in production, `lax` in development
- maxAge: 7 days (604800000 milliseconds)
- path: `/api/v1/auth/refresh` (restricted scope)

### ✅ HTTP Status Codes

- `200 OK` - Successful login
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account deactivated
- `500 Internal Server Error` - Server errors

## Request Example

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

## Response Examples

### Success Response (200)

**Headers:**
```
Set-Cookie: refreshToken=eyJhbGc...; Path=/api/v1/auth/refresh; HttpOnly; SameSite=Lax; Max-Age=604800
```

**Body:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Refresh token is NOT included in response body for security

### Invalid Credentials (401)

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### Account Deactivated (403)

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Account has been deactivated"
}
```

### Validation Error (400)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Security Features

### 1. Password Security
- Bcrypt comparison (constant-time)
- No plain text password storage
- Generic error messages (don't reveal if email exists)

### 2. Token Security
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- Separate secrets for each token type
- HttpOnly cookies prevent XSS attacks

### 3. Cookie Security
- **httpOnly**: JavaScript cannot access cookie
- **secure**: Sent only over HTTPS in production
- **sameSite**: CSRF protection
- **path**: Restricted to refresh endpoint only

### 4. Error Handling
- Generic "Invalid email or password" (no user enumeration)
- Account status validation
- Proper HTTP status codes

## Client Integration

### JavaScript/TypeScript Example

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();

  // Store access token in memory or secure storage
  localStorage.setItem('accessToken', data.data.accessToken);

  // Refresh token is automatically stored in httpOnly cookie
  return data.data.user;
};
```

### Making Authenticated Requests

```typescript
const makeAuthenticatedRequest = async (url: string) => {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Include cookies for refresh token
  });

  if (response.status === 401) {
    // Token expired, refresh it
    await refreshAccessToken();
    // Retry the request
    return makeAuthenticatedRequest(url);
  }

  return response.json();
};
```

### Token Refresh Flow

```typescript
const refreshAccessToken = async () => {
  const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Sends refresh token cookie
  });

  if (!response.ok) {
    // Refresh token expired, redirect to login
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
};
```

## Testing

### Valid Login Test

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@tasksphere.com',
    password: 'password123'
  })
});

console.log(response.status); // 200
const data = await response.json();
console.log(data.data.user.email); // 'admin@tasksphere.com'
console.log(data.data.accessToken); // 'eyJhbGc...'

// Check for cookie
const cookies = response.headers.get('set-cookie');
console.log(cookies.includes('refreshToken')); // true
console.log(cookies.includes('HttpOnly')); // true
```

### Invalid Credentials Test

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'wrongpassword'
  })
});

console.log(response.status); // 401
const data = await response.json();
console.log(data.message); // 'Invalid email or password'
```

## Environment Configuration

Ensure these are set in your `.env` file:

```env
# Access token (15 minutes)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"

# Refresh token (7 days)
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"
REFRESH_TOKEN_EXPIRES_IN="7d"

# CORS (required for cookies)
CORS_ORIGIN="http://localhost:3000"

# Environment
NODE_ENV="development"
```

## Production Considerations

1. **HTTPS Required**: Cookies with `secure: true` require HTTPS
2. **CORS**: Ensure frontend origin is in `CORS_ORIGIN`
3. **Secrets**: Use strong, unique secrets in production
4. **Token Expiration**: Adjust based on security requirements
5. **Cookie SameSite**: Use `strict` in production for CSRF protection

## File Structure

```
backend/src/
├── infrastructure/
│   ├── auth/
│   │   └── auth.service.ts           # Login logic & token generation
│   ├── config/
│   │   └── env.config.ts              # Cookie & JWT configuration
│   ├── http/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts     # Login handler & cookie setting
│   │   └── routes/
│   │       └── auth.routes.ts         # Route definition
│   └── validation/
│       ├── auth.validation.ts         # Login validation
│       └── schemas/
│           └── auth.schema.ts         # Zod schema
```

## Test Credentials

From seed data:
- Admin: `admin@tasksphere.com` / `password123`
- User: `user@tasksphere.com` / `password123`
