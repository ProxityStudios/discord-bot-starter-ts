import type { CommandsService } from './services/commands';
import type { MessagingService } from './services/messaging';
import type { Service } from './services/service';

export enum CommandName {
	// General
	Hello = 'hello',
	Help = 'help',
}

export enum CommandCategory {
	General = 'General',
}

export interface Services {
	[key: string]: Service;

	messaging: MessagingService;
	commands: CommandsService;
}
