import { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import { getRedisConnection, type CampaignPrepareJob } from "@/server/queue";

const worker = new Worker<CampaignPrepareJob>(
  "campaigns",
  async (job) => {
    const campaign = await prisma.campaign.findFirst({
      where: { id: job.data.campaignId, workspaceId: job.data.workspaceId },
      select: { id: true, name: true },
    });
    if (!campaign) throw new Error("Campaign not found in the requested workspace.");

    await prisma.event.create({
      data: {
        workspaceId: job.data.workspaceId,
        type: "campaign.prepared",
        payload: { campaignId: campaign.id, campaignName: campaign.name },
      },
    });
  },
  { connection: getRedisConnection() },
);

worker.on("completed", (job) => console.info(`Campaign job ${job.id} completed.`));
worker.on("failed", (job, error) => {
  console.error(`Campaign job ${job?.id ?? "unknown"} failed:`, error);
});

async function shutdown() {
  await worker.close();
  await getRedisConnection().quit();
  await prisma.$disconnect();
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
