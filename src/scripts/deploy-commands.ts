/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Container from 'typedi';
import glob from 'glob';
import { Config } from '../config';
import { Logger } from '../logger';

const commandsPath = path.join(__dirname, '..', 'commands');

const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
  ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
});

const commands = [];

for (const file of commandFiles) {
  const command = require(file).default;
  commands.push(command.data.toJSON());
}

const config = Container.get(Config);
const logger = Container.get(Logger);
logger.info('Deploying commands...', {
  commands,
});

const rest = new REST({ version: '9' }).setToken(config.discord.token);

rest
  .put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), { body: commands })
  .then(() => logger.info('Successfully registered application commands.'))
  .catch((error) => logger.error('Could not deploy commands', { error }));
