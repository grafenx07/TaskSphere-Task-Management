# POST /auth/refresh Implementation Guide

## Endpoint Details

```
POST /api/v1/auth/refresh
Content-Type: application/json
Cookie: refreshToken=<token>
```

## Features Implemented

### ✅ Refresh Token Verification

**Verification Process:**
1. Extract refresh token from httpOnly cookie (or fallback to request body)
2. Verify token signature using REFRESH_TOKEN_SECRET
3. Check token expiration (7 days)
4. Validate user still exists in database
5. Verify user account is active

**Security Checks:**
- Token signature validation
- Expiration validation
- User existence check
- Account status verification

### ✅ New Access Token Issuance

**Configuration:**
- Expiration: 15 minutes
- Algorithm: HS256
- Payload: userId, email, role
- Secret: JWT_SECRET

### ✅ Error Handling

**Handled Scenarios:**
- Invalid token signature → `401 Unauthorized`
- Expired refresh token → `401 Unauthorized`
- User not found → `401 Unauthorized`
- Account deactivated → `403 Forbidden`
- Missing token → `400 Bad Request`

**Security Measures:**
- Generic error messages (no sensitive information leaked)
- Proper HTTP status codes
- Distinction between invalid and expired tokens
- Account status validation

## Request Examples

### With Cookie (Recommended)

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  --cookie "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### With Request Body (Fallback)

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Response Examples

### Success Response (200)

```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Expired Token (401)

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Refresh token has expired"
}
```

### Invalid Token (401)

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid refresh token"
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

### Missing Token (400)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Refresh token is required"
}
```

## HTTP Status Codes

- `200 OK` - Token refreshed successfully
- `400 Bad Request` - No refresh token provided
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Account deactivated
- `500 Internal Server Error` - Server error

## Token Lifecycle

```
1. User logs in
   ├─> Access Token (15m) → Stored in memory/localStorage
   └─> Refresh Token (7d) → Stored in httpOnly cookie

2. Access token expires after 15 minutes
   └─> Client detects 401 on API request

3. Client calls /auth/refresh
   ├─> Sends refresh token (from cookie automatically)
   └─> Server validates refresh token

4. If valid:
   ├─> Server generates new access token
   └─> Client stores new access token

5. If invalid/expired:
   ├─> Clear tokens
   └─> Redirect to login
```

## Client Integration

### Automatic Token Refresh

```typescript
// API client with automatic token refresh
class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  async request(url: string, options: RequestInit = {}) {
    // Add access token to request
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    };

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Include cookies
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && !this.isRefreshing) {
      const newToken = await this.refreshAccessToken();

      if (newToken) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh to complete
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Send refresh token cookie
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // Refresh failed, logout user
        this.logout();
        return null;
      }

      const data = await response.json();
      const newToken = data.data.accessToken;

      this.accessToken = newToken;

      // Notify all waiting requests
      this.refreshSubscribers.forEach(callback => callback(newToken));
      this.refreshSubscribers = [];

      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private logout() {
    this.accessToken = null;
    window.location.href = '/login';
  }
}

export const apiClient = new ApiClient();
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';

export const useTokenRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Refresh token every 14 minutes (before 15-minute expiration)
    const interval = setInterval(async () => {
      setIsRefreshing(true);

      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.data.accessToken);
        } else {
          // Refresh failed, logout
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, []);

  return { isRefreshing };
};
```

### Axios Interceptor Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  withCredentials: true // Include cookies
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const { data } = await api.post('/auth/refresh');

        // Update access token
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

## Security Considerations

### 1. Token Storage
- **Access Token**: Memory or localStorage (short-lived, acceptable risk)
- **Refresh Token**: HttpOnly cookie only (prevents XSS)

### 2. Cookie Security
- `httpOnly: true` - JavaScript cannot access
- `secure: true` - HTTPS only in production
- `sameSite: 'strict'` - CSRF protection
- `path: '/api/v1/auth/refresh'` - Limited scope

### 3. Error Messages
- Generic messages to prevent user enumeration
- No distinction between "user not found" and "invalid token"
- Logged details for debugging (not exposed to client)

### 4. Token Validation
- Signature verification
- Expiration check
- User existence validation
- Account status verification

## Testing

### Valid Refresh Token Test

```javascript
// 1. Login to get refresh token cookie
const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@tasksphere.com',
    password: 'password123'
  })
});

// 2. Extract cookie and use it to refresh
const refreshResponse = await fetch('http://localhost:3001/api/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Automatically sends cookie
});

console.log(refreshResponse.status); // 200
const data = await refreshResponse.json();
console.log(data.data.accessToken); // New access token
```

### Expired Token Test

```javascript
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Expired token

const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken: expiredToken })
});

console.log(response.status); // 401
const data = await response.json();
console.log(data.message); // 'Refresh token has expired'
```

### Invalid Token Test

```javascript
const invalidToken = 'invalid.token.here';

const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken: invalidToken })
});

console.log(response.status); // 401
const data = await response.json();
console.log(data.message); // 'Invalid refresh token'
```

### Missing Token Test

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

console.log(response.status); // 400
const data = await response.json();
console.log(data.message); // 'Refresh token is required'
```

## Validation Flow

```
Request → Validation Middleware
           ├─> Check cookie for refreshToken
           ├─> Check body for refreshToken
           ├─> Use cookie if available
           └─> Error if neither exists

Valid Token → Controller
               └─> Pass to Service

Service → Verify Token
          ├─> Check signature
          ├─> Check expiration
          ├─> Validate user exists
          ├─> Validate account active
          └─> Generate new access token

Response ← New Access Token
```

## File Structure

```
backend/src/
├── infrastructure/
│   ├── auth/
│   │   └── auth.service.ts        # Token verification & generation
│   ├── http/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts # Refresh handler
│   │   └── routes/
│   │       └── auth.routes.ts     # Route definition
│   └── validation/
│       ├── auth.validation.ts     # Cookie + body validation
│       └── schemas/
│           └── auth.schema.ts     # Zod schema
```

## Production Recommendations

1. **Token Expiration**: Consider shorter access token lifetime (5-15 minutes)
2. **Refresh Token Rotation**: Issue new refresh token on each refresh
3. **Token Blacklisting**: Implement Redis-based token revocation
4. **Rate Limiting**: Limit refresh attempts per IP/user
5. **Logging**: Log all refresh attempts for security auditing
6. **HTTPS**: Always use HTTPS in production for cookie security
