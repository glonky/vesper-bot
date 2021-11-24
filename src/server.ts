/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import path from 'path';
import Container from 'typedi';
import { Client, Collection } from 'discord.js';
import glob from 'glob';
import { Config } from './config';
import { Command, ExtendedClient } from './interfaces';
import { Logger } from './logger';
import { RedisService } from './services';
import { SlashCommandSubcommandBuilder } from './builders';

const config = Container.get(Config);
const logger = Container.get(Logger);

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
  ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
});
const eventFiles = glob.sync(`${eventsPath}/**/*.{js,ts}`, {
  ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
});

RedisService.init();

// Create a new client instance
const client = new Client({ intents: config.discord.intents }) as ExtendedClient;

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(file).default as Command;

  if (!command) {
    logger.warn(`Command is not a valid command.`, { file });
    continue;
  }

  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);

  if (command.data.options) {
    for (const option of command.data.options) {
      const optionAsSubCommand = option as SlashCommandSubcommandBuilder;
      logger.info(`Loading sub-command`, {
        command: command.data.name,
        subCommand: optionAsSubCommand.name,
      });
      client.commands.set(`${command.data.name}.${optionAsSubCommand.name}`, command);
    }
  } else {
    logger.info(`Loading command`, {
      command: command.data.name,
    });
  }
}

for (const file of eventFiles) {
  const event = require(file).default;
  logger.info(`Loading event`, {
    command: event.name,
  });

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
(async () => {
  // Login to Discord with your client's token
  await client.login(config.discord.token);

  // const fullPermissions: GuildApplicationCommandPermissionData[] = [
  //   {
  //     id: '876543210987654321',
  //     permissions: [
  //       {
  //         id: config.discord.customBotRole,
  //         permission: true,
  //         type: 'ROLE',
  //       },
  //     ],
  //   },
  // ];

  // await client.guilds.cache.get(config.discord.guildId)?.commands.permissions.set({
  //   fullPermissions,
  // });
})();
