import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { enqueueCampaignPreparation } from "@/server/queue";

export async function POST(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignId } = await context.params;
  const parsedId = z.string().uuid().safeParse(campaignId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "A valid campaign ID is required." }, { status: 400 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { workspaceId: true },
  });
  if (!profile) return NextResponse.json({ error: "Workspace not found." }, { status: 403 });

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsedId.data, workspaceId: profile.workspaceId },
    select: { id: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const job = await enqueueCampaignPreparation({
    campaignId: campaign.id,
    workspaceId: profile.workspaceId,
  });
  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
