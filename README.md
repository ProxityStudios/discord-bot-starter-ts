# Discord Bot Starter ⚡ (TypeScript Edition)

This is a TypeScript template for creating Discord bots using the [discord.js](https://discord.js.org/) library. This repo provides a robust foundation, packed with useful features to jumpstart your bot development.

## How to use

1. Clone or download this repository
2. Run `npm install` to install the required packages
3. Rename `.env.example` to `.env` and fill in
4. Run `npm run dev` to start the bot in development mode
5. Write your bot logic in the `src` folder

## Scripts

### Development mode

```bash
npm run dev
```

Starts the bot using `ts-node-dev`, which auto-restarts on code changes.

### Production mode

```bash
npm start
```

Compiles TypeScript to JavaScript and starts the bot using `ts-node`.

## Features

### Command handler

This flexible system lets you manage your bot's commands effortlessly. Create new commands by following a simple structure:

```typescript
// src/commands/example.ts
export default class ExampleCommand extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: CommandName.Example,
      description: "Demonstrates command creation.",
      category: CommandCategory.General,
    });
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply("Hello from the command handler!");
  }
}
```

**Subfolders and organization:** Organize your commands logically using subfolders based on their categories (e.g., `src/commands/moderation/ban.ts`). Remember to update the `types.ts` file with new command names and categories.

### Slash commands

You can create slash command options by using `this.data` property. For example, this is how you can add a `String` option:

```typescript
super(client, {
  // ...
});

// Creating slash command options
this.data.addStringOption((option) =>
  option
    .setName("input")
    .setDescription("The input to echo back")
    .setRequired(true)
);
```
