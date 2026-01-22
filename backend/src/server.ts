import 'dotenv/config';
import app from './app';
import { config } from '@infrastructure/config/env.config';
import { disconnectPrisma, checkDatabaseConnection } from '@infrastructure/database/prisma';

const PORT = config.port;
const HOST = process.env.HOST || '0.0.0.0';

// Start server with database health check
const startServer = async () => {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`
  ╔═══════════════════════════════════════╗
  ║   TaskSphere API Server Started      ║
  ╠═══════════════════════════════════════╣
  ║   Environment: ${config.env.padEnd(23)}║
  ║   Port:        ${String(PORT).padEnd(23)}║
  ║   API Version: ${config.apiVersion.padEnd(23)}║
  ║   URL:         http://localhost:${PORT.toString().padEnd(5)}║
  ║   Database:    Connected ✓            ║
  ╚═══════════════════════════════════════╝
      `);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} signal received: closing HTTP server`);

      server.close(async () => {
        console.log('HTTP server closed');

        // Disconnect from database
        await disconnectPrisma();

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
  throw reason;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;
