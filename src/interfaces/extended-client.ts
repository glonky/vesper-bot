import { Client, Collection } from 'discord.js';

export interface ExtendedClient extends Client {
  commands: Collection<unknown, unknown>;
}
