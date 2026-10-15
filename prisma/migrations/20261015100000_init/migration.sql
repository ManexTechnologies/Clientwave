CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "workspace_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "business_profiles" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "sender_name" TEXT,
    "sender_email" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "business_profile_id" UUID,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "icps" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "campaign_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "icps_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "campaign_id" UUID,
    "icp_id" UUID,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "company" TEXT,
    "title" TEXT,
    "profile_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "lead_scans" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "score" INTEGER,
    "result" JSONB NOT NULL DEFAULT '{}',
    "scanned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_scans_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "campaign_id" UUID,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "message_variants" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_variants_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "sequences" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "campaign_id" UUID,
    "name" TEXT NOT NULL,
    "definition" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "send_logs" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "send_logs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "replies" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "send_log_id" UUID,
    "body" TEXT NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "replies_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "suppression_list" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suppression_list_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "sender_name" TEXT NOT NULL DEFAULT '',
    "sender_email" TEXT NOT NULL DEFAULT '',
    "daily_limit" INTEGER NOT NULL DEFAULT 50,
    "score_threshold" INTEGER NOT NULL DEFAULT 70,
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "languages" TEXT[] NOT NULL DEFAULT ARRAY['English']::TEXT[],
    "encrypted_api_key" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workspaces_owner_user_id_key" ON "workspaces"("owner_user_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_workspace_id_idx" ON "users"("workspace_id");
CREATE UNIQUE INDEX "business_profiles_workspace_id_key" ON "business_profiles"("workspace_id");
CREATE INDEX "campaigns_workspace_id_status_idx" ON "campaigns"("workspace_id", "status");
CREATE INDEX "icps_workspace_id_idx" ON "icps"("workspace_id");
CREATE INDEX "leads_workspace_id_email_idx" ON "leads"("workspace_id", "email");
CREATE INDEX "lead_scans_workspace_id_lead_id_idx" ON "lead_scans"("workspace_id", "lead_id");
CREATE INDEX "messages_workspace_id_status_idx" ON "messages"("workspace_id", "status");
CREATE INDEX "message_variants_workspace_id_message_id_idx" ON "message_variants"("workspace_id", "message_id");
CREATE INDEX "sequences_workspace_id_idx" ON "sequences"("workspace_id");
CREATE INDEX "send_logs_workspace_id_status_idx" ON "send_logs"("workspace_id", "status");
CREATE INDEX "replies_workspace_id_received_at_idx" ON "replies"("workspace_id", "received_at");
CREATE UNIQUE INDEX "suppression_list_workspace_id_email_key" ON "suppression_list"("workspace_id", "email");
CREATE INDEX "events_workspace_id_created_at_idx" ON "events"("workspace_id", "created_at");
CREATE UNIQUE INDEX "settings_workspace_id_key" ON "settings"("workspace_id");
CREATE INDEX "audit_log_workspace_id_created_at_idx" ON "audit_log"("workspace_id", "created_at");
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_business_profile_id_fkey" FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "icps" ADD CONSTRAINT "icps_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "icps" ADD CONSTRAINT "icps_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_icp_id_fkey" FOREIGN KEY ("icp_id") REFERENCES "icps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_scans" ADD CONSTRAINT "lead_scans_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_scans" ADD CONSTRAINT "lead_scans_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "message_variants" ADD CONSTRAINT "message_variants_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_variants" ADD CONSTRAINT "message_variants_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "send_logs" ADD CONSTRAINT "send_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "send_logs" ADD CONSTRAINT "send_logs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_send_log_id_fkey" FOREIGN KEY ("send_log_id") REFERENCES "send_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "suppression_list" ADD CONSTRAINT "suppression_list_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "settings" ADD CONSTRAINT "settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "workspace_id" FROM "users" WHERE "id" = auth.uid()
$$;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "business_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "icps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_scans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "send_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "replies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suppression_list" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_workspace_isolation" ON "users"
  USING ("workspace_id" = public.current_workspace_id())
  WITH CHECK ("workspace_id" = public.current_workspace_id());
CREATE POLICY "workspaces_workspace_isolation" ON "workspaces"
  USING ("id" = public.current_workspace_id());

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'business_profiles', 'campaigns', 'icps', 'leads', 'lead_scans', 'messages',
    'message_variants', 'sequences', 'send_logs', 'replies', 'suppression_list',
    'events', 'settings', 'audit_log'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I USING ("workspace_id" = public.current_workspace_id()) WITH CHECK ("workspace_id" = public.current_workspace_id())',
      table_name || '_workspace_isolation', table_name
    );
  END LOOP;
END $$;
