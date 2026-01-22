# Error Handling Documentation

## Backend Error Handling

### Centralized Error Handler

The backend uses a centralized error handling middleware located at `backend/src/infrastructure/http/middlewares/error-handler.ts`.

#### Features

1. **Custom AppError Class**
   - Extends native Error class
   - Includes HTTP status codes
   - Supports validation errors array
   - Factory methods for common errors

2. **Automatic Error Detection**
   - Prisma database errors
   - JWT authentication errors
   - Validation errors (Zod)
   - Custom application errors

3. **Environment-Aware Logging**
   - Stack traces in development only
   - Sanitized messages in production
   - Comprehensive error logging

### AppError Factory Methods

```typescript
// Bad Request (400)
throw AppError.badRequest('Invalid input', [
  { field: 'email', message: 'Invalid format' }
]);

// Unauthorized (401)
throw AppError.unauthorized('Invalid credentials');

// Forbidden (403)
throw AppError.forbidden('Insufficient permissions');

// Not Found (404)
throw AppError.notFound('User not found');

// Conflict (409)
throw AppError.conflict('Email already exists');

// Validation Error (422)
throw AppError.validationError('Validation failed', errors);

// Internal Server Error (500)
throw AppError.internal('Something went wrong');
```

### Error Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    // response data
  }
}
```

**Error Response:**
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

**Development Error Response (includes stack trace):**
```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Error description",
  "stack": "Error stack trace..."
}
```

### Handled Error Types

1. **Prisma Errors**
   - `PrismaClientKnownRequestError` → 400 Bad Request
   - `PrismaClientValidationError` → 400 Bad Request
   - Unique constraint violations → 409 Conflict

2. **JWT Errors**
   - `JsonWebTokenError` → 401 Unauthorized
   - `TokenExpiredError` → 401 Unauthorized

3. **Validation Errors**
   - Zod validation failures → 422 Unprocessable Entity
   - Custom validation → 400 Bad Request

4. **Application Errors**
   - Resource not found → 404 Not Found
   - Permission denied → 403 Forbidden
   - Authentication failed → 401 Unauthorized

### Error Middleware Flow

```
Request → Route Handler → Business Logic
                              ↓ (error thrown)
                         Error Handler
                              ↓
                    Format Error Response
                              ↓
                      Send to Client
```

## Frontend Error Handling

### API Client Error Interceptor

The frontend uses Axios interceptors for centralized error handling (`frontend/src/lib/api-client.ts`).

#### Features

1. **Automatic Token Refresh**
   - Detects 401 errors
   - Attempts token refresh
   - Retries original request
   - Redirects to login on failure

2. **Error Propagation**
   - Preserves error details from backend
   - Exposes validation errors
   - Maintains error messages

### Error Handling in Components

**Example: Login Form**
```typescript
try {
  await login(data.email, data.password);
  toast.success('Welcome back!');
} catch (error: any) {
  const message = error.response?.data?.message || 'Invalid credentials';
  toast.error(message);
}
```

**Example: Task Creation**
```typescript
try {
  await apiClient.post('/tasks', data);
  toast.success('Task created successfully');
} catch (error: any) {
  const message = error.response?.data?.message || 'Failed to create task';
  const validationErrors = error.response?.data?.errors;

  if (validationErrors && Array.isArray(validationErrors)) {
    validationErrors.forEach((err: any) => {
      toast.error(`${err.field}: ${err.message}`);
    });
  } else {
    toast.error(message);
  }
}
```

### Toast Notifications

Uses Sonner for user-friendly error messages:

- **Success**: Green toast with checkmark
- **Error**: Red toast with error icon
- **Info**: Blue toast with info icon
- **Warning**: Yellow toast with warning icon

### Error States in UI

1. **Loading States**
   - Spinner animations
   - Disabled buttons
   - Loading skeletons

2. **Error States**
   - Empty state messages
   - Error boundaries (React)
   - Fallback UI

3. **Network Errors**
   - Automatic retry with token refresh
   - Redirect to login on auth failure
   - User-friendly error messages

## Error Handling Best Practices

### Backend

1. **Always Use AppError**
   ```typescript
   // ✅ Good
   throw AppError.notFound('Task not found');

   // ❌ Bad
   throw new Error('Task not found');
   ```

2. **Include Context in Validation Errors**
   ```typescript
   // ✅ Good
   throw AppError.badRequest('Validation failed', [
     { field: 'email', message: 'Invalid format' },
     { field: 'password', message: 'Too short' }
   ]);

   // ❌ Bad
   throw AppError.badRequest('Validation failed');
   ```

3. **Never Expose Sensitive Information**
   ```typescript
   // ✅ Good
   throw AppError.unauthorized('Invalid credentials');

   // ❌ Bad (exposes user existence)
   throw AppError.unauthorized('User not found with that email');
   ```

### Frontend

1. **Always Handle Errors in Try-Catch**
   ```typescript
   // ✅ Good
   try {
     await apiClient.post('/tasks', data);
     toast.success('Success!');
   } catch (error: any) {
     toast.error(error.response?.data?.message || 'Error occurred');
   }

   // ❌ Bad (unhandled promise rejection)
   await apiClient.post('/tasks', data);
   ```

2. **Display User-Friendly Messages**
   ```typescript
   // ✅ Good
   toast.error('Failed to create task. Please try again.');

   // ❌ Bad
   toast.error(error.stack);
   ```

3. **Handle Network Errors**
   ```typescript
   catch (error: any) {
     if (error.code === 'ERR_NETWORK') {
       toast.error('Network error. Please check your connection.');
     } else {
       toast.error(error.response?.data?.message || 'An error occurred');
     }
   }
   ```

## Testing Error Scenarios

### Backend Tests

```typescript
// Test validation errors
it('should return 400 for invalid email', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'invalid', password: 'Test123!' });

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
});

// Test authentication errors
it('should return 401 for invalid token', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', 'Bearer invalid-token');

  expect(res.status).toBe(401);
});
```

### Frontend Tests

```typescript
// Test error display
it('should show error toast on API failure', async () => {
  mockApiClient.post.mockRejectedValue({
    response: { data: { message: 'Task creation failed' } }
  });

  await userEvent.click(screen.getByText('Create Task'));

  expect(screen.getByText('Task creation failed')).toBeInTheDocument();
});
```

## Common Error Scenarios

### 400 Bad Request
- Invalid input format
- Missing required fields
- Validation failures

### 401 Unauthorized
- Missing authentication token
- Invalid token
- Expired token (before refresh attempt)

### 403 Forbidden
- Insufficient permissions
- Role-based access denied
- Resource ownership violation

### 404 Not Found
- Resource doesn't exist
- Invalid route/endpoint

### 409 Conflict
- Email already registered
- Duplicate resource creation

### 422 Unprocessable Entity
- Validation errors from Zod
- Business logic validation failures

### 500 Internal Server Error
- Unexpected server errors
- Database connection failures
- Third-party service errors

## Monitoring & Logging

### Development
- Console logging with stack traces
- Detailed error information
- Request/response logging (Morgan)

### Production
- Sanitized error messages
- No stack traces exposed
- Structured logging (consider Winston/Pino)
- Error tracking service (consider Sentry)

## Future Improvements

1. **Error Tracking Service**
   - Integrate Sentry or similar
   - Real-time error monitoring
   - Error aggregation and analysis

2. **Retry Logic**
   - Exponential backoff for network errors
   - Automatic retry for transient failures

3. **Circuit Breaker**
   - Prevent cascading failures
   - Graceful degradation

4. **Error Boundaries**
   - React error boundaries for component errors
   - Fallback UI for crashed components

5. **Offline Support**
   - Queue failed requests
   - Retry when connection restored
