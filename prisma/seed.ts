import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = process.env.SEED_USER_ID;
  const email = process.env.SEED_USER_EMAIL;
  if (!userId || !email) {
    throw new Error(
      "Set SEED_USER_ID and SEED_USER_EMAIL to an existing Supabase user before seeding.",
    );
  }

  const workspace = await prisma.workspace.upsert({
    where: { ownerUserId: userId },
    update: {},
    create: { ownerUserId: userId, name: "ClientWave Demo" },
  });
  await prisma.user.upsert({
    where: { id: userId },
    update: { email, workspaceId: workspace.id },
    create: { id: userId, email, workspaceId: workspace.id },
  });
  await prisma.settings.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: { workspaceId: workspace.id },
  });

  const profile = await prisma.businessProfile.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      companyName: "ClientWave Demo",
      description: "A sample business profile for local development.",
    },
  });
  await prisma.campaign.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: { workspaceId: workspace.id, businessProfileId: profile.id },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      workspaceId: workspace.id,
      businessProfileId: profile.id,
      name: "Welcome campaign",
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
