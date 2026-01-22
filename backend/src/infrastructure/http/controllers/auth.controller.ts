import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '@infrastructure/auth/auth.service';
import { RegisterInput } from '@infrastructure/validation/schemas/auth.schema';
import {
  LoginDTO,
  RefreshTokenDTO,
} from '@application/interfaces/auth.interface';

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   *
   * @description
   * - Validates email uniqueness
   * - Hashes password using bcrypt
   * - Creates new user record
   * - Returns user data with JWT tokens
   * - Stores refresh token in httpOnly cookie
   *
   * @status
   * - 201: User successfully registered
   * - 400: Validation error
   * - 409: Email already exists
   * - 500: Internal server error
   */
  async register(req: Request, res: Response): Promise<void> {
    const data: RegisterInput = req.body;

    const result = await authService.register(data);

    // Import config here to avoid circular dependencies
    const { config } = await import('@infrastructure/config/env.config');

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
      path: '/api/v1/auth/refresh',
    });

    // Return access token in response
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   *
   * @description
   * - Validates user credentials (email and password)
   * - Generates access token (15 minutes expiration)
   * - Generates refresh token (7 days expiration)
   * - Returns access token in response body
   * - Stores refresh token in httpOnly cookie
   *
   * @status
   * - 200: Login successful
   * - 400: Validation error
   * - 401: Invalid credentials
   * - 403: Account deactivated
   * - 500: Internal server error
   */
  async login(req: Request, res: Response): Promise<void> {
    const data: LoginDTO = req.body;

    const result = await authService.login(data);

    // Import config here to avoid circular dependencies
    const { config } = await import('@infrastructure/config/env.config');

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
      path: '/api/v1/auth/refresh', // Restrict cookie to refresh endpoint
    });

    // Return access token in response (don't include refresh token in body)
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   *
   * @description
   * - Verifies refresh token from httpOnly cookie
   * - Validates user still exists and is active
   * - Issues new access token (15 minutes)
   * - Handles expired and invalid tokens securely
   *
   * @status
   * - 200: Token refreshed successfully
   * - 400: Validation error (no refresh token provided)
   * - 401: Invalid or expired refresh token
   * - 403: User account deactivated
   * - 500: Internal server error
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    // Refresh token is extracted by validation middleware from cookie or body
    const { refreshToken }: RefreshTokenDTO = req.body;

    const result = await authService.refreshToken(refreshToken);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: result,
    });
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   *
   * @status
   * - 200: User profile retrieved
   * - 401: Unauthorized
   * - 404: User not found
   * - 500: Internal server error
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const user = await authService.getUserById(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { user },
    });
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   *
   * @description
   * Clears the refresh token cookie to log out the user.
   * In a stateless JWT setup, access tokens remain valid until expiration.
   * For immediate invalidation, implement Redis-based token blacklisting.
   *
   * @status
   * - 200: Logout successful
   * - 401: Unauthorized
   * - 500: Internal server error
   */
  async logout(_req: Request, res: Response): Promise<void> {
    const { config } = await import('../../../infrastructure/config/env.config');

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite as 'strict' | 'lax' | 'none',
      path: '/api/v1/auth/refresh',
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Logout successful. Please discard your access token.',
    });
  }
}

export default new AuthController();
