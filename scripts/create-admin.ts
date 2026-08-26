import "dotenv/config";
import readline from "readline";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

const getConnectionString = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  return url.replace(/sslmode=(require|prefer|verify-ca)/g, "sslmode=verify-full");
};

const connectionString = getConnectionString();
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function isTransientDatabaseError(error: unknown): boolean {
  if (error instanceof Error && /ECONNREFUSED|ETIMEDOUT|ECONNRESET/.test(error.message)) {
    return true;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    return code === "P1001" || code === "P2028";
  }

  return false;
}

async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientDatabaseError(error) || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }

  throw new Error("Database operation failed after retries.");
}

function prompt(query: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hideInput) {
      // Simple hidden input handling for terminal password entry
      let input = "";
      process.stdin.on("data", (char) => {
        const charStr = char.toString("utf8");
        switch (charStr) {
          case "\n":
          case "\r":
          case "\u0004":
            process.stdin.removeAllListeners("data");
            break;
          default:
            input += charStr;
            break;
        }
      });
      rl.question(query, () => {
        rl.close();
        resolve(input.trim());
      });
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("=== REALSPACE Admin User Creation Script ===");

  const name = await prompt("Enter Admin Name (default: Admin): ");
  const adminName = name || "Admin";

  const email = await prompt("Enter Admin Email: ");
  if (!email) {
    console.error("Error: Email is required.");
    process.exit(1);
  }

  const password = await prompt("Enter Admin Password: ");
  if (!password || password.length < 6) {
    console.error("Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  console.log("\nHashing password and creating admin user in database...");

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await withDatabaseRetry(() =>
    prisma.adminUser.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name: adminName,
        passwordHash: passwordHash,
      },
      create: {
        email: email.toLowerCase(),
        name: adminName,
        passwordHash: passwordHash,
      },
    })
  );

  console.log("\nSuccess! Admin user created or updated:");
  console.log(`- ID: ${admin.id}`);
  console.log(`- Name: ${admin.name}`);
  console.log(`- Email: ${admin.email}`);
  console.log(`- Created At: ${admin.createdAt}`);
}

main()
  .catch((err) => {
    console.error("Error creating admin user:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
