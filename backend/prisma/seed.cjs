require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  // ⚠️ Esto reinicia tu catálogo e inventario
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryUnit.deleteMany();
  await prisma.product.deleteMany();

  const products = {};

  async function createProduct(key, data) {
    products[key] = await prisma.product.create({ data });
  }

  // =========================
  // CONSOLAS
  // =========================
  await createProduct("ps5Slim", {
    name: "PlayStation 5 Slim",
    brand: "Sony",
    model: "CFI-2000",
    category: "CONSOLE",
    description: "Consola PS5 Slim (incluye 1 control).",
    imageUrl: "",
    priceCents: 16499_00,
    currency: "MXN",
  });

  await createProduct("xboxSeriesX", {
    name: "Xbox Series X",
    brand: "Microsoft",
    model: "Series X",
    category: "CONSOLE",
    description: "Consola Xbox Series X.",
    imageUrl: "",
    priceCents: 15499_00,
    currency: "MXN",
  });

  await createProduct("switchOLED", {
    name: "Nintendo Switch OLED",
    brand: "Nintendo",
    model: "OLED",
    category: "CONSOLE",
    description: "Nintendo Switch versión OLED.",
    imageUrl: "",
    priceCents: 5999_00,
    currency: "MXN",
  });

  await createProduct("steamDeckOLED", {
    name: "Steam Deck OLED",
    brand: "Valve",
    model: "OLED 512GB",
    category: "CONSOLE",
    description: "Consola portátil Steam Deck OLED.",
    imageUrl: "",
    priceCents: 14399_00,
    currency: "MXN",
  });

  await createProduct("switchLite", {
    name: "Nintendo Switch Lite",
    brand: "Nintendo",
    model: "Lite",
    category: "CONSOLE",
    description: "Nintendo Switch Lite portátil.",
    imageUrl: "",
    priceCents: 4299_00,
    currency: "MXN",
  });

  // =========================
  // ACCESORIOS
  // =========================
  await createProduct("dualsense", {
    name: "DualSense",
    brand: "Sony",
    model: "Wireless Controller",
    category: "ACCESSORY",
    description: "Control inalámbrico DualSense para PS5.",
    imageUrl: "",
    priceCents: 1460_00,
    currency: "MXN",
  });

  await createProduct("xboxController", {
    name: "Xbox Wireless Controller",
    brand: "Microsoft",
    model: "Robot White",
    category: "ACCESSORY",
    description: "Control inalámbrico para Xbox Series.",
    imageUrl: "",
    priceCents: 1069_00,
    currency: "MXN",
  });

  await createProduct("switchProController", {
    name: "Nintendo Pro Controller",
    brand: "Nintendo",
    model: "Switch Pro",
    category: "ACCESSORY",
    description: "Control Pro para Nintendo Switch.",
    imageUrl: "",
    priceCents: 1499_00,
    currency: "MXN",
  });

  await createProduct("pulse3d", {
    name: "PULSE 3D Headset",
    brand: "Sony",
    model: "Wireless",
    category: "ACCESSORY",
    description: "Audífonos inalámbricos para PS5.",
    imageUrl: "",
    priceCents: 1899_00,
    currency: "MXN",
  });

  await createProduct("xboxHeadset", {
    name: "Xbox Wireless Headset",
    brand: "Microsoft",
    model: "Wireless",
    category: "ACCESSORY",
    description: "Audífonos inalámbricos Xbox.",
    imageUrl: "",
    priceCents: 2199_00,
    currency: "MXN",
  });

  // =========================
  // JUEGOS
  // =========================
  await createProduct("zeldaTotk", {
    name: "The Legend of Zelda: TOTK",
    brand: "Nintendo",
    model: "Switch",
    category: "GAME",
    description: "Juego para Nintendo Switch.",
    imageUrl: "",
    priceCents: 999_00,
    currency: "MXN",
  });

  await createProduct("marioKart8", {
    name: "Mario Kart 8 Deluxe",
    brand: "Nintendo",
    model: "Switch",
    category: "GAME",
    description: "Juego para Nintendo Switch.",
    imageUrl: "",
    priceCents: 1065_00,
    currency: "MXN",
  });

  await createProduct("eldenRing", {
    name: "Elden Ring",
    brand: "FromSoftware",
    model: "PS5",
    category: "GAME",
    description: "Juego de aventura/acción (versión PS5).",
    imageUrl: "",
    priceCents: 799_00,
    currency: "MXN",
  });

  await createProduct("spiderMan2", {
    name: "Marvel's Spider-Man 2",
    brand: "Sony",
    model: "PS5",
    category: "GAME",
    description: "Juego de acción para PlayStation 5.",
    imageUrl: "",
    priceCents: 1199_00,
    currency: "MXN",
  });

  await createProduct("haloInfinite", {
    name: "Halo Infinite",
    brand: "Xbox Game Studios",
    model: "Xbox",
    category: "GAME",
    description: "Shooter para Xbox.",
    imageUrl: "",
    priceCents: 899_00,
    currency: "MXN",
  });

  await createProduct("forzaHorizon5", {
    name: "Forza Horizon 5",
    brand: "Xbox Game Studios",
    model: "Xbox",
    category: "GAME",
    description: "Juego de carreras para Xbox.",
    imageUrl: "",
    priceCents: 999_00,
    currency: "MXN",
  });

  await createProduct("animalCrossing", {
    name: "Animal Crossing: New Horizons",
    brand: "Nintendo",
    model: "Switch",
    category: "GAME",
    description: "Juego de simulación para Nintendo Switch.",
    imageUrl: "",
    priceCents: 1099_00,
    currency: "MXN",
  });

  await createProduct("superSmashBros", {
    name: "Super Smash Bros. Ultimate",
    brand: "Nintendo",
    model: "Switch",
    category: "GAME",
    description: "Juego de peleas para Nintendo Switch.",
    imageUrl: "",
    priceCents: 999_00,
    currency: "MXN",
  });

  // =========================
  // INVENTARIO
  // =========================
  await prisma.inventoryUnit.createMany({
    data: [
      // Consolas
      {
        productId: products.ps5Slim.id,
        serialNumber: "PS5SLIM-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Incluye 1 control.",
      },
      {
        productId: products.ps5Slim.id,
        serialNumber: "PS5SLIM-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Consola lista para renta.",
      },
      {
        productId: products.ps5Slim.id,
        serialNumber: "PS5SLIM-0003",
        status: "MAINTENANCE",
        condition: "FAIR",
        notes: "Revisión de ventilación.",
      },
      {
        productId: products.xboxSeriesX.id,
        serialNumber: "XSX-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Consola completa.",
      },
      {
        productId: products.xboxSeriesX.id,
        serialNumber: "XSX-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Incluye control.",
      },
      {
        productId: products.switchOLED.id,
        serialNumber: "NSOLED-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Incluye dock.",
      },
      {
        productId: products.switchOLED.id,
        serialNumber: "NSOLED-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Joy-Con en buen estado.",
      },
      {
        productId: products.steamDeckOLED.id,
        serialNumber: "SDECK-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "512GB OLED.",
      },
      {
        productId: products.steamDeckOLED.id,
        serialNumber: "SDECK-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Incluye cargador.",
      },
      {
        productId: products.switchLite.id,
        serialNumber: "SWLITE-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Color gris.",
      },

      // Accesorios
      {
        productId: products.dualsense.id,
        serialNumber: "DS-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Control blanco.",
      },
      {
        productId: products.dualsense.id,
        serialNumber: "DS-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Incluye cable de carga.",
      },
      {
        productId: products.xboxController.id,
        serialNumber: "XWC-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Robot White.",
      },
      {
        productId: products.xboxController.id,
        serialNumber: "XWC-0002",
        status: "AVAILABLE",
        condition: "FAIR",
        notes: "Desgaste leve en sticks.",
      },
      {
        productId: products.switchProController.id,
        serialNumber: "NPC-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Control funcional.",
      },
      {
        productId: products.switchProController.id,
        serialNumber: "NPC-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Incluye cable USB-C.",
      },
      {
        productId: products.pulse3d.id,
        serialNumber: "PULSE3D-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Audífonos PS5.",
      },
      {
        productId: products.xboxHeadset.id,
        serialNumber: "XHS-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Audífonos Xbox.",
      },

      // Juegos
      {
        productId: products.zeldaTotk.id,
        serialNumber: "TOTK-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Cartucho en excelente estado.",
      },
      {
        productId: products.zeldaTotk.id,
        serialNumber: "TOTK-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Caja original.",
      },
      {
        productId: products.marioKart8.id,
        serialNumber: "MK8D-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Cartucho funcional.",
      },
      {
        productId: products.marioKart8.id,
        serialNumber: "MK8D-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Caja original.",
      },
      {
        productId: products.eldenRing.id,
        serialNumber: "ER-PS5-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Caja original.",
      },
      {
        productId: products.eldenRing.id,
        serialNumber: "ER-PS5-0002",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Disco sin detalles.",
      },
      {
        productId: products.spiderMan2.id,
        serialNumber: "SM2-PS5-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Disco PS5.",
      },
      {
        productId: products.haloInfinite.id,
        serialNumber: "HALO-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Versión física Xbox.",
      },
      {
        productId: products.forzaHorizon5.id,
        serialNumber: "FH5-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Versión física Xbox.",
      },
      {
        productId: products.animalCrossing.id,
        serialNumber: "ACNH-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Cartucho funcional.",
      },
      {
        productId: products.superSmashBros.id,
        serialNumber: "SSBU-0001",
        status: "AVAILABLE",
        condition: "GOOD",
        notes: "Cartucho funcional.",
      },
    ],
  });

  console.log("✅ Seed completado: catálogo ampliado con productos e inventario.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });