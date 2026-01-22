# POST /auth/register Implementation Guide

## Endpoint Details

```
POST /api/v1/auth/register
Content-Type: application/json
```

## Features Implemented

### ✅ Input Validation Using Zod

**Schema Rules:**
- Email: Valid email format, automatically trimmed and lowercased
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- Name: Optional, minimum 1 character if provided

**Validation Location:** `backend/src/infrastructure/validation/schemas/auth.schema.ts`

### ✅ Email Uniqueness Validation

Checks database for existing email before creating user. Returns `409 Conflict` if email already exists.

**Implementation:** `backend/src/infrastructure/auth/auth.service.ts` (lines 18-25)

### ✅ Password Hashing Using Bcrypt

- Salt rounds: 10
- Hashing performed before storing in database
- Original password never stored

**Implementation:** `backend/src/infrastructure/auth/auth.service.ts` (hashPassword method)

### ✅ Proper HTTP Status Codes

- `201 Created` - Successful registration
- `400 Bad Request` - Validation errors
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Server errors

## Request Example

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

## Response Examples

### Success Response (201)

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "newuser@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Validation Error Response (400)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

### Email Exists Error Response (409)

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

## Validation Rules

### Email
- ✅ Required field
- ✅ Must be valid email format
- ✅ Automatically converted to lowercase
- ✅ Trimmed of whitespace
- ✅ Must be unique in database

### Password
- ✅ Required field
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ Hashed with bcrypt before storage

### Name
- ⚪ Optional field
- ✅ If provided, must be at least 1 character
- ✅ Must be string type

## Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Passwords never stored in plain text
   - Password requirements enforced

2. **Email Security**
   - Format validation
   - Uniqueness check
   - Case-insensitive storage

3. **Token Security**
   - JWT access token (7 days default)
   - JWT refresh token (30 days default)
   - Separate secrets for each token type

4. **Error Handling**
   - No sensitive information leaked
   - Generic error messages for security
   - Proper HTTP status codes

## Testing

### Valid Registration Test

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123',
    name: 'Test User'
  })
});

console.log(response.status); // 201
const data = await response.json();
console.log(data.data.user.email); // 'test@example.com'
```

### Invalid Email Test

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'invalid-email',
    password: 'SecurePass123'
  })
});

console.log(response.status); // 400
const data = await response.json();
console.log(data.errors[0].field); // 'email'
```

### Weak Password Test

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'weak'
  })
});

console.log(response.status); // 400
const data = await response.json();
// Multiple password validation errors
```

### Duplicate Email Test

```javascript
// First registration (success)
await fetch('http://localhost:3001/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123'
  })
});

// Second registration with same email (fails)
const response = await fetch('http://localhost:3001/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123'
  })
});

console.log(response.status); // 409
```

## File Structure

```
backend/src/
├── application/interfaces/
│   └── auth.interface.ts          # TypeScript interfaces
├── infrastructure/
│   ├── auth/
│   │   └── auth.service.ts         # Business logic & bcrypt hashing
│   ├── http/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts  # HTTP handler
│   │   └── routes/
│   │       └── auth.routes.ts      # Route definition
│   └── validation/
│       ├── auth.validation.ts      # Validation middleware
│       └── schemas/
│           └── auth.schema.ts      # Zod schemas
```

## Next Steps

After successful registration, the client should:

1. Store the `accessToken` (for API requests)
2. Store the `refreshToken` (for token refresh)
3. Redirect to dashboard/home page
4. Include `Authorization: Bearer <accessToken>` header in subsequent requests
