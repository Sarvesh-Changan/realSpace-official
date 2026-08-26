import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  return url.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full');
};

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: "tsx prisma/seed.ts",
    path: 'prisma/migrations',
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});

