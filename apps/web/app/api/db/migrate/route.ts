import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Database Migration Endpoint
 * Runs SQL schema on Cloudflare D1
 * Only accessible in production with proper auth
 */
export async function POST(request: NextRequest) {
  try {
    // Add authentication check here
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read schema file
    const schemaPath = join(process.cwd(), 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // In Cloudflare Pages/Workers, we'd use env.DB here
    // For now, return instructions
    return NextResponse.json({
      message: 'Migration instructions',
      statements: statements.length,
      instructions: [
        '1. Create D1 database: wrangler d1 create gringo-crm',
        '2. Update wrangler.toml with database_id',
        '3. Run migration: wrangler d1 execute gringo-crm --file=./db/schema.sql',
        '4. Or use Cloudflare dashboard to run SQL',
      ],
      schema: schema.substring(0, 500) + '...',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}

