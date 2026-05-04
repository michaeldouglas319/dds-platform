import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Add SSL mode to handle self-signed certificates
const dbUrl = process.env.dds_POSTGRES_URL_NON_POOLING || '';
const urlWithSSL = dbUrl.includes('sslmode')
  ? dbUrl
  : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=require&ssl=true`;

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: urlWithSSL,
  },
});
