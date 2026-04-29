CREATE TABLE `gigSources` (
	`id` varchar(36) NOT NULL,
	`agentId` varchar(36) NOT NULL,
	`source` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` text,
	`relevanceScore` decimal(3,2),
	`status` enum('new','reviewed','applied','rejected') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gigSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `merchOrders` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`productId` varchar(36) NOT NULL,
	`printfulOrderId` varchar(100),
	`customerEmail` varchar(320) NOT NULL,
	`quantity` int NOT NULL,
	`totalPrice` int,
	`artistProfit` int,
	`status` enum('pending','confirmed','production','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`trackingNumber` varchar(100),
	`shippingDate` timestamp,
	`deliveryDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `merchProducts` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`printfulProductId` varchar(100),
	`type` enum('t_shirt','hoodie','sticker','poster','phone_case','mug','hat') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`basePrice` int,
	`retailPrice` int,
	`profitMargin` decimal(3,2),
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voiceCalls` (
	`id` varchar(36) NOT NULL,
	`agentId` varchar(36) NOT NULL,
	`targetName` varchar(255) NOT NULL,
	`targetPhone` varchar(20) NOT NULL,
	`purpose` varchar(100),
	`status` enum('initiated','ringing','connected','completed','failed','voicemail') NOT NULL DEFAULT 'initiated',
	`durationSeconds` int,
	`recordingUrl` text,
	`transcriptUrl` text,
	`outcome` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voiceCalls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `gigSources_agentId_idx` ON `gigSources` (`agentId`);--> statement-breakpoint
CREATE INDEX `gigSources_source_idx` ON `gigSources` (`source`);--> statement-breakpoint
CREATE INDEX `gigSources_relevanceScore_idx` ON `gigSources` (`relevanceScore`);--> statement-breakpoint
CREATE INDEX `merchOrders_userId_idx` ON `merchOrders` (`userId`);--> statement-breakpoint
CREATE INDEX `merchOrders_productId_idx` ON `merchOrders` (`productId`);--> statement-breakpoint
CREATE INDEX `merchOrders_status_idx` ON `merchOrders` (`status`);--> statement-breakpoint
CREATE INDEX `merchProducts_userId_idx` ON `merchProducts` (`userId`);--> statement-breakpoint
CREATE INDEX `merchProducts_type_idx` ON `merchProducts` (`type`);--> statement-breakpoint
CREATE INDEX `merchProducts_status_idx` ON `merchProducts` (`status`);--> statement-breakpoint
CREATE INDEX `voiceCalls_agentId_idx` ON `voiceCalls` (`agentId`);--> statement-breakpoint
CREATE INDEX `voiceCalls_status_idx` ON `voiceCalls` (`status`);--> statement-breakpoint
CREATE INDEX `voiceCalls_createdAt_idx` ON `voiceCalls` (`createdAt`);