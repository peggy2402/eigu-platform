import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres.ulftwxuosgqwgurhnkzf:Chienhpt102%24%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  },
});
