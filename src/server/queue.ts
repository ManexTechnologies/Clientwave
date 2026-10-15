import { Queue } from "bullmq";
import IORedis from "ioredis";

export type CampaignPrepareJob = {
  workspaceId: string;
  campaignId: string;
};

const globalForQueue = globalThis as unknown as {
  redis?: IORedis;
  campaignQueue?: Queue<CampaignPrepareJob>;
};

export function getRedisConnection() {
  if (!globalForQueue.redis) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is required.");
    globalForQueue.redis = new IORedis(url, { maxRetriesPerRequest: null });
  }
  return globalForQueue.redis;
}

export function getCampaignQueue() {
  if (!globalForQueue.campaignQueue) {
    globalForQueue.campaignQueue = new Queue<CampaignPrepareJob>("campaigns", {
      connection: getRedisConnection(),
    });
  }
  return globalForQueue.campaignQueue;
}

export async function enqueueCampaignPreparation(job: CampaignPrepareJob) {
  return getCampaignQueue().add("prepare", job, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}
