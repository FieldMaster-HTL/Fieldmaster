ALTER TABLE "farm" RENAME COLUMN "clerkOrganiasationId" TO "clerkOrganisationId";--> statement-breakpoint
ALTER TABLE "farm" DROP CONSTRAINT "farm_clerkOrganiasationId_unique";--> statement-breakpoint
ALTER TABLE "farm" ADD CONSTRAINT "farm_clerkOrganisationId_unique" UNIQUE("clerkOrganisationId");