CREATE TABLE `aggregatorAccounts` (
	`id` varchar(36) NOT NULL,
	`artistId` varchar(36) NOT NULL,
	`aggregatorId` varchar(100) NOT NULL,
	`accountName` varchar(255),
	`apiKey` text,
	`apiSecret` text,
	`accountStatus` enum('active','inactive','error'),
	`lastSync` timestamp,
	`syncError` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aggregatorAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`soundcloudUsername` varchar(255),
	`soundcloudAccessToken` text,
	`soundcloudUserId` varchar(255),
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`avatarUrl` text,
	`bio` text,
	`websiteUrl` text,
	`verified` boolean DEFAULT false,
	`distributionPreferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributionAnalytics` (
	`id` varchar(36) NOT NULL,
	`trackId` varchar(36) NOT NULL,
	`platformId` varchar(100),
	`date` timestamp NOT NULL,
	`platformsLive` int,
	`totalPlatforms` int,
	`healthScore` decimal(3,2),
	`failureRate` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distributionAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributionJobs` (
	`id` varchar(36) NOT NULL,
	`trackId` varchar(36) NOT NULL,
	`platformId` varchar(100) NOT NULL,
	`aggregatorId` varchar(100),
	`status` enum('queued','processing','live','failed','retrying','fallback') NOT NULL DEFAULT 'queued',
	`retryCount` int DEFAULT 0,
	`maxRetries` int DEFAULT 7,
	`errorMessage` text,
	`errorDetails` json,
	`platformTrackId` varchar(255),
	`platformUrl` text,
	`platformResponse` json,
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`nextRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distributionJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributionLogs` (
	`id` varchar(36) NOT NULL,
	`jobId` varchar(36) NOT NULL,
	`action` varchar(100),
	`status` enum('success','failure','pending'),
	`message` text,
	`details` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distributionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `musicVideoJobs` (
	`id` varchar(36) NOT NULL,
	`trackId` varchar(36) NOT NULL,
	`platformId` varchar(100),
	`status` enum('queued','processing','ready','uploaded','failed') NOT NULL DEFAULT 'queued',
	`waveforgeJobId` varchar(255),
	`videoUrl` text,
	`videoFileKey` text,
	`youtubeVideoId` varchar(255),
	`tiktokVideoId` varchar(255),
	`instagramVideoId` varchar(255),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicVideoJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformRegistry` (
	`id` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('streaming','social','aggregator','niche'),
	`integrationMethod` enum('direct_api','aggregator','manual'),
	`apiEndpoint` text,
	`apiDocsUrl` text,
	`credentialsRequired` json,
	`rateLimitPerHour` int,
	`webhookSupported` boolean DEFAULT false,
	`webhookEndpoint` text,
	`healthStatus` enum('unknown','healthy','degraded','down') NOT NULL DEFAULT 'unknown',
	`lastHealthCheck` timestamp,
	`estimatedTimeToLive` varchar(50),
	`priority` int DEFAULT 50,
	`enabled` boolean DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformRegistry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialMediaPosts` (
	`id` varchar(36) NOT NULL,
	`trackId` varchar(36) NOT NULL,
	`platformId` varchar(100),
	`status` enum('queued','posted','failed','retrying') NOT NULL DEFAULT 'queued',
	`postContent` text,
	`mediaUrls` json,
	`platformPostId` varchar(255),
	`platformUrl` text,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialMediaPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` varchar(36) NOT NULL,
	`artistId` varchar(36) NOT NULL,
	`soundcloudTrackId` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` text,
	`audioFileKey` text,
	`durationMs` int,
	`genre` varchar(100),
	`mood` json,
	`isrc` varchar(20),
	`releaseDate` timestamp,
	`artworkUrl` text,
	`artworkFileKey` text,
	`metadata` json,
	`distributionConfig` json,
	`distributionStatus` json,
	`distributionCoverageScore` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `aggregatorAccounts_artistId_idx` ON `aggregatorAccounts` (`artistId`);--> statement-breakpoint
CREATE INDEX `artists_userId_idx` ON `artists` (`userId`);--> statement-breakpoint
CREATE INDEX `artists_soundcloudUserId_idx` ON `artists` (`soundcloudUserId`);--> statement-breakpoint
CREATE INDEX `distributionAnalytics_trackId_idx` ON `distributionAnalytics` (`trackId`);--> statement-breakpoint
CREATE INDEX `distributionAnalytics_date_idx` ON `distributionAnalytics` (`date`);--> statement-breakpoint
CREATE INDEX `distributionJobs_trackId_idx` ON `distributionJobs` (`trackId`);--> statement-breakpoint
CREATE INDEX `distributionJobs_platformId_idx` ON `distributionJobs` (`platformId`);--> statement-breakpoint
CREATE INDEX `distributionJobs_status_idx` ON `distributionJobs` (`status`);--> statement-breakpoint
CREATE INDEX `distributionLogs_jobId_idx` ON `distributionLogs` (`jobId`);--> statement-breakpoint
CREATE INDEX `musicVideoJobs_trackId_idx` ON `musicVideoJobs` (`trackId`);--> statement-breakpoint
CREATE INDEX `musicVideoJobs_status_idx` ON `musicVideoJobs` (`status`);--> statement-breakpoint
CREATE INDEX `platformRegistry_category_idx` ON `platformRegistry` (`category`);--> statement-breakpoint
CREATE INDEX `socialMediaPosts_trackId_idx` ON `socialMediaPosts` (`trackId`);--> statement-breakpoint
CREATE INDEX `socialMediaPosts_status_idx` ON `socialMediaPosts` (`status`);--> statement-breakpoint
CREATE INDEX `tracks_artistId_idx` ON `tracks` (`artistId`);--> statement-breakpoint
CREATE INDEX `tracks_soundcloudTrackId_idx` ON `tracks` (`soundcloudTrackId`);