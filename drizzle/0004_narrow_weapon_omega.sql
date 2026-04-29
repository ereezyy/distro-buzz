CREATE TABLE `aiAgents` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`talentType` enum('musician','model','visual_artist','performer','influencer','voice_actor','photographer','dj') NOT NULL,
	`personality` text,
	`status` enum('active','paused','inactive') NOT NULL DEFAULT 'active',
	`lastActivityAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiAgents_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiAgents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`gigId` varchar(36),
	`template` varchar(100),
	`customization` text,
	`documentUrl` text,
	`status` enum('draft','proposed','signed','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gigs` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`agentId` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`venue` varchar(255),
	`date` timestamp,
	`rateCents` int,
	`status` enum('discovered','interested','negotiating','booked','completed','declined') NOT NULL DEFAULT 'discovered',
	`source` varchar(100),
	`aiRecommendationScore` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legalFilings` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`type` enum('dmca_takedown','copyright_registration','contract','brand_protection','ip_portfolio') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','filed','in_progress','resolved','expired') NOT NULL DEFAULT 'draft',
	`documentUrl` text,
	`filingDate` timestamp,
	`resolvedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalFilings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediaAssets` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`type` enum('photo','video','bio','press_kit','audio','document') NOT NULL,
	`title` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`brandCompliance` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mediaAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreachLog` (
	`id` varchar(36) NOT NULL,
	`agentId` varchar(36) NOT NULL,
	`targetName` varchar(255) NOT NULL,
	`targetEmail` varchar(320),
	`targetPhone` varchar(20),
	`message` text,
	`responseReceived` boolean DEFAULT false,
	`response` text,
	`status` enum('sent','bounced','replied','interested','declined','no_response') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreachLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(100),
	`stripeSubscriptionId` varchar(100),
	`features` json DEFAULT ('[]'),
	`status` enum('active','paused','canceled','past_due') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `aiAgents_userId_idx` ON `aiAgents` (`userId`);--> statement-breakpoint
CREATE INDEX `aiAgents_talentType_idx` ON `aiAgents` (`talentType`);--> statement-breakpoint
CREATE INDEX `contracts_userId_idx` ON `contracts` (`userId`);--> statement-breakpoint
CREATE INDEX `contracts_gigId_idx` ON `contracts` (`gigId`);--> statement-breakpoint
CREATE INDEX `contracts_status_idx` ON `contracts` (`status`);--> statement-breakpoint
CREATE INDEX `gigs_userId_idx` ON `gigs` (`userId`);--> statement-breakpoint
CREATE INDEX `gigs_agentId_idx` ON `gigs` (`agentId`);--> statement-breakpoint
CREATE INDEX `gigs_date_idx` ON `gigs` (`date`);--> statement-breakpoint
CREATE INDEX `gigs_status_idx` ON `gigs` (`status`);--> statement-breakpoint
CREATE INDEX `legalFilings_userId_idx` ON `legalFilings` (`userId`);--> statement-breakpoint
CREATE INDEX `legalFilings_type_idx` ON `legalFilings` (`type`);--> statement-breakpoint
CREATE INDEX `legalFilings_status_idx` ON `legalFilings` (`status`);--> statement-breakpoint
CREATE INDEX `mediaAssets_userId_idx` ON `mediaAssets` (`userId`);--> statement-breakpoint
CREATE INDEX `mediaAssets_type_idx` ON `mediaAssets` (`type`);--> statement-breakpoint
CREATE INDEX `outreachLog_agentId_idx` ON `outreachLog` (`agentId`);--> statement-breakpoint
CREATE INDEX `outreachLog_status_idx` ON `outreachLog` (`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_userId_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripeCustomerId_idx` ON `subscriptions` (`stripeCustomerId`);