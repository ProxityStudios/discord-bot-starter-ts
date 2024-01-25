import { Client, Events, GatewayIntentBits } from "discord.js";
import { Service } from "./services/service";
import { MessagingService } from "./services/messaging";
import { CommandsService } from "./services/commands";

interface IServices {
  [key: string]: Service;

  messaging: MessagingService;
  commands: CommandsService;
}

export class CustomClient extends Client {
  public services: IServices;
  private startingServices: Service[];

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.services = {
      messaging: new MessagingService(this),
      commands: new CommandsService(this),
    };
    this.startingServices = Object.values(this.services);

    this.on(Events.ClientReady, this.onClientReady);
  }

  public async init() {
    try {
      await Promise.all(
        Object.values(this.services).map(async (s) => {
          const serviceName = `\x1b[1m${s.constructor.name}\x1b[0m`;
          console.log(
            `\x1b[33mservice\x1b[0m: Starting service: ${serviceName}`
          );
          await s.init();
          console.log(
            `\x1b[33mservice\x1b[0m: Service ${serviceName} started successfully.`
          );
        })
      );
    } catch (error) {
      console.error(`error: Error starting services: ${error}`);
      throw error;
    }
  }

  private async onClientReady() {
    await Promise.all(
      Object.values(this.services).map((s) => s.onClientReady())
    );

    console.log(
      `\x1b[32mOK\x1b[0m: \x1b[1m${this.user?.tag}\x1b[0m is now ready to serve.`
    );
  }

  public checkServices(service: Service) {
    this.startingServices = this.startingServices.filter((s) => s !== service);

    if (this.startingServices.length === 0) {
      console.log("\x1b[32mOK\x1b[0m: Services started successfully.");
    }
  }
}
