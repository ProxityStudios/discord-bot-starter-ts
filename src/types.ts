import type { CommandsService } from './services/Commands';
import type { MessagingService } from './services/Messaging';
import type { Service } from './services/Service';

export enum CommandName {
	// General
	Echo = 'echo',
	Help = 'help',

	// Moderation
	Kick = 'kick',
}

export enum CommandCategory {
	General = 'General',
	Moderation = 'Moderation',
}

export interface Services {
	[key: string]: Service;

	messaging: MessagingService;
	commands: CommandsService;
}
