import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import { errorHandler } from '@infrastructure/http/middlewares/error-handler';
import { notFoundHandler } from '@infrastructure/http/middlewares/not-found-handler';
import { config } from '@infrastructure/config/env.config';
import authRoutes from '@infrastructure/http/routes/auth.routes';
import taskRoutes from '@infrastructure/http/routes/task.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: config.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Compression middleware
    this.app.use(compression());

    // Cookie parser middleware
    this.app.use(cookieParser());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (_req: Request, res: Response) => {
      const { checkDatabaseConnection } = await import('@infrastructure/database/prisma');
      const dbHealthy = await checkDatabaseConnection();

      res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'success' : 'error',
        message: dbHealthy ? 'Server is running' : 'Database connection failed',
        timestamp: new Date().toISOString(),
        environment: config.env,
        database: dbHealthy ? 'connected' : 'disconnected',
      });
    });

    // API Routes
    this.app.use(`/api/${config.apiVersion}/auth`, authRoutes);
    this.app.use(`/api/${config.apiVersion}/tasks`, taskRoutes);

    // Additional routes will be added here
    // this.app.use(`/api/${config.apiVersion}/users`, userRoutes);

    // Welcome route
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        message: 'Welcome to TaskSphere API',
        version: config.apiVersion,
        documentation: '/api/v1/docs',
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

export default new App().getApp();
