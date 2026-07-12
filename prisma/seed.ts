import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_USER_ID_2 = "00000000-0000-4000-8000-000000000002";

async function main() {
  await prisma.profile.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      displayName: "Demo Sælger",
      avatarUrl: null,
    },
  });

  await prisma.profile.upsert({
    where: { id: DEMO_USER_ID_2 },
    update: {},
    create: {
      id: DEMO_USER_ID_2,
      displayName: "Anden Sælger",
      avatarUrl: null,
    },
  });

  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Seed: ${count} produkter findes allerede — springer demo-produkter over.`);
    return;
  }

  await prisma.product.createMany({
    data: [
      {
        userId: DEMO_USER_ID,
        title: "Titleist TSR3 Driver",
        description: "Velholdt driver, 9 grader, stiff flex.",
        price: 2499,
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
        category: "clubs",
        brand: "Titleist",
        clubType: "driver",
        flex: "stiff",
        hand: "right",
        gender: "unisex",
        sold: false,
      },
      {
        userId: DEMO_USER_ID,
        title: "FootJoy Pro SL Sko",
        description: "Størrelse EU 43, brugt få gange.",
        price: 899,
        imageUrl: "https://images.unsplash.com/photo-1589696485114-eb167a0a7752?w=800",
        category: "shoes",
        brand: "FootJoy",
        size: "EU 43",
        gender: "male",
        sold: false,
      },
      {
        userId: DEMO_USER_ID_2,
        title: "Ping Hoofer Stand Bag",
        description: "14 dividers, let stand bag.",
        price: 1299,
        imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649051?w=800",
        category: "bags",
        brand: "Ping",
        dividerCount: 14,
        stand: "yes",
        gender: "unisex",
        sold: false,
      },
    ],
  });

  console.log("Seed: demo-profiler og produkter oprettet.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
