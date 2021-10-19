import { Client } from 'discord.js';
import Container from 'typedi';
import { Logger } from '../logger';

export default {
  execute(client: Client) {
    Container.get(Logger).info(`Ready! Logged in as ${client.user?.tag}`);
  },
  name: 'ready',
  once: true,
};
