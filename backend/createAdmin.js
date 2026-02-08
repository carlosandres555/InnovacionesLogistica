import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const password = "Car3118091899**";

  try {
    console.log("Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("Creando super admin...");
    const admin = await prisma.user.create({
      data: {
        email: "lina.gr2103@gmail.com",
        password: hashedPassword,
        firstName: "Lina",
        lastName: "Gonzalez",
        phone: "+573106692719",
        role: "ADMIN",
      },
    });

    console.log("✅ Super admin creado exitosamente!");
    console.log("Email:", admin.email);
    console.log("Nombre:", admin.firstName, admin.lastName);
    console.log("Rol:", admin.role);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createSuperAdmin();
