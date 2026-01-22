import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  corsOrigin: string;
  databaseUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  cookie: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const validateProductionSecrets = () => {
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET || '';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || '';

    // Check if secrets are still using default/weak values
    if (jwtSecret.includes('change-this') || jwtSecret.length < 32) {
      throw new Error('Production JWT_SECRET must be a strong secret (min 32 characters)');
    }
    if (refreshSecret.includes('change-this') || refreshSecret.length < 32) {
      throw new Error('Production REFRESH_TOKEN_SECRET must be a strong secret (min 32 characters)');
    }
  }
};

// Validate production secrets on startup
validateProductionSecrets();

export const config: Config = {
  env: getEnvVariable('NODE_ENV', 'development'),
  port: parseInt(getEnvVariable('PORT', '3001'), 10),
  apiVersion: getEnvVariable('API_VERSION', 'v1'),
  corsOrigin: getEnvVariable('CORS_ORIGIN', 'http://localhost:3000'),
  databaseUrl: getEnvVariable('DATABASE_URL'),
  jwt: {
    secret: getEnvVariable('JWT_SECRET'),
    expiresIn: getEnvVariable('JWT_EXPIRES_IN', '15m'),
    refreshSecret: getEnvVariable('REFRESH_TOKEN_SECRET'),
    refreshExpiresIn: getEnvVariable('REFRESH_TOKEN_EXPIRES_IN', '7d'),
  },
  cookie: {
    secure: getEnvVariable('NODE_ENV', 'development') === 'production',
    httpOnly: true,
    sameSite: getEnvVariable('NODE_ENV', 'development') === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
};
