# Database Infrastructure

## Prisma Client Setup

This module provides a production-ready Prisma client configuration with proper connection handling for both development and production environments.

## Features

### 🔄 Connection Management
- Singleton pattern to prevent multiple instances
- Automatic reconnection handling
- Graceful shutdown support
- Hot reload support in development

### 📊 Logging
- **Development**: Detailed query logging with duration
- **Production**: Error-only logging for performance

### 🏥 Health Checks
- Database connectivity verification
- Built-in health check endpoint integration

### 💼 Transaction Support
- Clean transaction interface
- Type-safe operations

## Usage Examples

### Basic Usage

```typescript
import prisma from '@infrastructure/database/prisma';

// Query example
const users = await prisma.user.findMany();

// Create example
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: 'hashed_password',
  },
});
```

### Using Transactions

```typescript
import { executeTransaction } from '@infrastructure/database/prisma';

const result = await executeTransaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com', password: 'hashed' },
  });

  const task = await tx.task.create({
    data: {
      title: 'First task',
      userId: user.id,
    },
  });

  return { user, task };
});
```

### Health Check

```typescript
import { checkDatabaseConnection } from '@infrastructure/database/prisma';

const isHealthy = await checkDatabaseConnection();
if (!isHealthy) {
  console.error('Database is not available');
}
```

### Graceful Shutdown

```typescript
import { disconnectPrisma } from '@infrastructure/database/prisma';

process.on('SIGTERM', async () => {
  await disconnectPrisma();
  process.exit(0);
});
```

## Environment-Specific Behavior

### Development
- Detailed query logging with duration
- Pretty error formatting
- Global instance to prevent hot-reload issues
- Query performance metrics

### Production
- Minimal logging (errors only)
- Automatic connection on startup
- Connection pool optimization
- Performance-focused configuration

## Connection Pool

Prisma automatically manages connection pooling based on:
- `DATABASE_URL` configuration
- Connection pool size (configurable via URL parameters)
- Connection timeout settings

Example with connection pool config:
```
DATABASE_URL="postgresql://user:password@localhost:5432/db?connection_limit=10&pool_timeout=20"
```

## Troubleshooting

### Connection Issues
1. Verify `DATABASE_URL` in `.env`
2. Check PostgreSQL is running: `docker-compose ps`
3. Test connection: `npm run prisma:studio`

### Migration Issues
1. Reset database: `npm run prisma:reset` (WARNING: deletes data)
2. Generate client: `npm run prisma:generate`
3. Run migrations: `npm run prisma:migrate`

### Performance
- Monitor queries in development mode
- Use indexes for frequently queried fields
- Leverage Prisma's query optimization
- Consider connection pooling for high traffic
