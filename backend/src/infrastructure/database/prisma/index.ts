/**
 * Prisma Database Module
 * Central export point for all Prisma-related utilities
 */

export { default as prisma } from './prisma.client';
export {
  disconnectPrisma,
  checkDatabaseConnection,
  executeTransaction,
} from './prisma.client';

// Re-export Prisma types for convenience
export type { Prisma } from '@prisma/client';
