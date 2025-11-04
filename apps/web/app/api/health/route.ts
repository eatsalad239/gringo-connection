import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Returns system status and availability
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      api: 'operational',
      database: 'operational', // In future: check actual DB
      cache: 'operational',
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(checks, { status: 200 });
}

