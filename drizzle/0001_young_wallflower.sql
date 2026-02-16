ALTER TABLE "github_repository" ADD COLUMN "allowed_events" text[];--> statement-breakpoint
ALTER TABLE "github_repository" ADD COLUMN "group_ids" text[];--> statement-breakpoint
ALTER TABLE "github_repository" ADD COLUMN "message_template" text;