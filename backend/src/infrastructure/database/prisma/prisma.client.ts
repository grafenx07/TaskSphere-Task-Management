import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma Client Singleton Factory
 * Ensures single instance across the application
 */
const prismaClientSingleton = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Configure logging based on environment
  const logConfig: Prisma.LogLevel[] = isDevelopment
    ? ['query', 'error', 'warn', 'info']
    : ['error'];

  const prismaClient = new PrismaClient({
    log: logConfig,
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  });

  // Lifecycle hooks
  prismaClient.$on('query' as never, ((e: Prisma.QueryEvent) => {
    if (isDevelopment) {
      console.log('Query: ' + e.query);
      console.log('Duration: ' + e.duration + 'ms');
    }
  }) as never);

  prismaClient.$on('error' as never, ((e: any) => {
    console.error('Prisma Error:', e);
  }) as never);

  // Connection lifecycle management
  if (isProduction) {
    prismaClient.$connect()
      .then(() => console.log('✅ Database connected successfully'))
      .catch((error) => {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
      });
  }

  return prismaClient;
};

/**
 * Global type declaration for Prisma Client singleton
 * Prevents multiple instances in development (hot reload)
 */
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Prisma Client Instance
 * - In development: Uses global variable to prevent multiple instances during hot reload
 * - In production: Creates a single instance
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed
 */
export const disconnectPrisma = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
};

/**
 * Health check function
 * Verifies database connectivity
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Execute database operations in a transaction
 * Provides a clean interface for transactional operations
 */
export const executeTransaction = async <T>(
  callback: (prisma: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback);
};

export default prisma;
