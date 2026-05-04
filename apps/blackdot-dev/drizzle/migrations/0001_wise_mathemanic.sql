CREATE TABLE "app_config_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"schema" jsonb,
	"changes_summary" text,
	"change_type" varchar(50) NOT NULL,
	"diff" jsonb,
	"metadata" jsonb,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"namespace" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"key" varchar(100) NOT NULL,
	"full_path" varchar(300) NOT NULL,
	"data" jsonb NOT NULL,
	"schema" jsonb,
	"description" text,
	"tags" text[],
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"required_access_level" "access_level" DEFAULT 'member' NOT NULL,
	"owner_clerk_id" text,
	"cache_ttl" integer DEFAULT 3600,
	"immutable" boolean DEFAULT false NOT NULL,
	"parent_config_id" text,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_configs_full_path_unique" UNIQUE("full_path")
);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "app_config_versions" ADD CONSTRAINT "app_config_versions_config_id_app_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."app_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_configs" ADD CONSTRAINT "app_configs_parent_config_id_app_configs_id_fk" FOREIGN KEY ("parent_config_id") REFERENCES "public"."app_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_config_versions_config_id_idx" ON "app_config_versions" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "app_config_versions_version_idx" ON "app_config_versions" USING btree ("version");--> statement-breakpoint
CREATE INDEX "app_config_versions_change_type_idx" ON "app_config_versions" USING btree ("change_type");--> statement-breakpoint
CREATE INDEX "app_config_versions_created_at_idx" ON "app_config_versions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "app_config_versions_config_version_idx" ON "app_config_versions" USING btree ("config_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "app_configs_namespace_keys_idx" ON "app_configs" USING btree ("namespace","category","key");--> statement-breakpoint
CREATE INDEX "app_configs_namespace_idx" ON "app_configs" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "app_configs_category_idx" ON "app_configs" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "app_configs_full_path_idx" ON "app_configs" USING btree ("full_path");--> statement-breakpoint
CREATE INDEX "app_configs_access_level_idx" ON "app_configs" USING btree ("required_access_level");--> statement-breakpoint
CREATE INDEX "app_configs_version_idx" ON "app_configs" USING btree ("version");--> statement-breakpoint
CREATE INDEX "app_configs_is_active_idx" ON "app_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "app_configs_data_type_idx" ON "app_configs" USING btree (((data->>'type')));--> statement-breakpoint
CREATE INDEX "app_configs_tags_idx" ON "app_configs" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "app_configs_created_by_idx" ON "app_configs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "app_configs_updated_at_idx" ON "app_configs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_workspaces_metadata_global" ON "workspaces" USING btree ((metadata->>'isGlobal'));