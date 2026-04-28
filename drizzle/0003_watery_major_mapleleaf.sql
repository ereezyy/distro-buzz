CREATE TABLE `adEvents` (
	`id` varchar(36) NOT NULL,
	`adId` varchar(36) NOT NULL,
	`eventType` enum('impression','click') NOT NULL,
	`ipHash` varchar(64),
	`userAgent` text,
	`referrer` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adPlacements` (
	`id` varchar(36) NOT NULL,
	`advertiserId` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`linkUrl` text,
	`position` enum('homepage_banner','featured_artist','sponsored_recommendation','sidebar_banner','feed_inline') NOT NULL,
	`status` enum('draft','active','paused','expired','rejected') NOT NULL DEFAULT 'draft',
	`budgetCents` int DEFAULT 0,
	`spentCents` int DEFAULT 0,
	`cpcCents` int DEFAULT 10,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adPlacements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `adEvents_adId_idx` ON `adEvents` (`adId`);--> statement-breakpoint
CREATE INDEX `adEvents_eventType_idx` ON `adEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `adPlacements_advertiserId_idx` ON `adPlacements` (`advertiserId`);--> statement-breakpoint
CREATE INDEX `adPlacements_status_idx` ON `adPlacements` (`status`);--> statement-breakpoint
CREATE INDEX `adPlacements_position_idx` ON `adPlacements` (`position`);