import readline from "readline";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const admin = await prisma.adminUser.upsert({
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
  });

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
