import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/settings";
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", request.url));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", request.url));
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return NextResponse.redirect(new URL("/login?error=missing_user", request.url));
  }

  const workspace = await prisma.workspace.upsert({
    where: { ownerUserId: user.id },
    update: {},
    create: { name: user.email.split("@")[0] + "'s workspace", ownerUserId: user.id },
  });
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email, fullName: user.user_metadata.full_name ?? null },
    create: {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata.full_name ?? null,
      workspaceId: workspace.id,
    },
  });
  await prisma.settings.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: { workspaceId: workspace.id },
  });

  return NextResponse.redirect(new URL(destination, request.url));
}
