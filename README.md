# Discord Bot Starter TS

This is a TypeScript template for creating Discord bots using the [discord.js](https://discord.js.org/) library. It provides a basic structure and some useful features to help you get started quickly and easily.

## How to use

1. Clone or download this repository
2. Run `npm install` to install the required packages
3. Rename `config.example.json` to `config.json` and fill out everything
4. Run `npm run dev` to start the bot in development mode
5. Write your bot logic in the `src` folder

## Scripts

### Development mode

```bash
npm run dev
```

This will start the bot using `ts-node-dev`, which will automatically restart the bot when you make changes to the code.

### Production mode

```bash
npm start
```

This will compile the TypeScript code into JavaScript and start the bot using `ts-node`.

## Features

- **Command handler**: A flexible and modular way to create and manage commands for your bot. You can add new commands by creating a file in the `src/commands` folder that follows this structure:

```typescript
// Import necessary modules
import { ChatInputCommandInteraction } from "discord.js";
import { CustomClient } from "../../client";
import { Command } from "../../command";
import { CommandCategory, CommandName } from "../../types";

export default class extends Command {
  public constructor(client: CustomClient) {
    super(client, {
      name: CommandName.Example, // The name of the command
      description: "This is an example description.", // A brief description of what the command does
      category: CommandCategory.General, // The category of the command
    });
  }

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    // The logic of the command goes here
    await interaction.reply({
      content: `This is an example answer.`,
    });
  }
}
```

You can also organize your commands into subfolders based on their categories. For example, you can create a file in `src/commands/moderation/ban.ts` for a ban command. However, you will need to add the new command name and category to the `types.ts` file as well. For example:

```typescript
export enum CommandName {
  // ...
  // Moderation
  Ban = "ban",
}

export enum CommandCategory {
  // ...
  Moderation = "Moderation",
}
```
