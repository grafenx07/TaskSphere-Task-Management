import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import prisma from '@infrastructure/database/prisma/prisma.client';
import { config } from '@infrastructure/config/env.config';
import { AppError } from '@infrastructure/http/middlewares/app-error';
import {
  RegisterDTO,
  LoginDTO,
  AuthResponse,
  TokenPayload,
} from '@application/interfaces/auth.interface';

export class AuthService {
  private readonly saltRounds = 10;

  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw AppError.conflict('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw AppError.forbidden('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   *
   * @description
   * - Verifies refresh token signature and expiration
   * - Validates user still exists and is active
   * - Generates new access token
   *
   * @param token - Refresh token from cookie or request body
   * @returns New access token
   *
   * @throws AppError.unauthorized - If token is invalid, expired, or user inactive
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token signature and expiration
      const payload = jwt.verify(
        token,
        config.jwt.refreshSecret
      ) as TokenPayload;

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw AppError.unauthorized('Invalid refresh token');
      }

      if (!user.isActive) {
        throw AppError.forbidden('Account has been deactivated');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken };
    } catch (error) {
      // Handle JWT-specific errors
      if (error instanceof jwt.JsonWebTokenError) {
        throw AppError.unauthorized('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('Refresh token has expired');
      }
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unexpected errors
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('Access token has expired');
      }
      throw AppError.unauthorized('Invalid access token');
    }
  }
}

export default new AuthService();
