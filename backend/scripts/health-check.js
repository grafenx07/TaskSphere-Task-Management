#!/usr/bin/env node

/**
 * Pre-deployment health check script
 * Validates environment configuration before deployment
 */

const requiredBackendEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CORS_ORIGIN',
  'NODE_ENV',
  'PORT'
];

const requiredFrontendEnvVars = [
  'NEXT_PUBLIC_API_URL'
];

function checkBackendEnv() {
  console.log('🔍 Checking Backend Environment Variables...\n');

  const missing = [];
  const warnings = [];

  requiredBackendEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else if (varName.includes('SECRET') && value.includes('change-this')) {
      warnings.push(`${varName} contains default value - MUST change for production`);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  console.log('✅ Backend environment OK\n');
  return true;
}

function checkDatabaseUrl() {
  console.log('🔍 Checking Database Configuration...\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    return false;
  }

  if (dbUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.error('❌ DATABASE_URL points to localhost in production!');
    return false;
  }

  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
    return false;
  }

  console.log('✅ Database URL OK\n');
  return true;
}

function checkCORS() {
  console.log('🔍 Checking CORS Configuration...\n');

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    console.error('❌ CORS_ORIGIN not set');
    return false;
  }

  if (corsOrigin.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  CORS_ORIGIN includes localhost in production!');
    console.warn('   Make sure to update after frontend deployment\n');
  }

  console.log(`✅ CORS Origin: ${corsOrigin}\n`);
  return true;
}

function checkPorts() {
  console.log('🔍 Checking Port Configuration...\n');

  const port = process.env.PORT || '3001';
  console.log(`✅ Port: ${port}\n`);
  return true;
}

// Run all checks
const checks = [
  checkBackendEnv,
  checkDatabaseUrl,
  checkCORS,
  checkPorts
];

let allPassed = true;
checks.forEach(check => {
  if (!check()) {
    allPassed = false;
  }
});

if (allPassed) {
  console.log('🎉 All deployment checks passed!\n');
  process.exit(0);
} else {
  console.error('\n❌ Deployment checks failed. Fix issues before deploying.\n');
  process.exit(1);
}
