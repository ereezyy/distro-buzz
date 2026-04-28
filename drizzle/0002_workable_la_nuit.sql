DROP INDEX `artists_userId_idx` ON `artists`;--> statement-breakpoint
ALTER TABLE `artists` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `artists` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `artists` ADD CONSTRAINT `artists_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `artists` ADD CONSTRAINT `artists_email_idx` UNIQUE(`email`);