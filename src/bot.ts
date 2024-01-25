import { CustomClient } from "./client";
import config from "../config.json";

const bot = async () => {
  try {
    const client = new CustomClient();
    await client.init();
    await client.login(config.token);
  } catch (error) {
    console.error(error);
  }
};

bot();
