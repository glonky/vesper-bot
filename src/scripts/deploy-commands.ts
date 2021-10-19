/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import { REST } from '@discordjs/rest';
// import { Routes } from 'discord-api-types/v9';
import Container from 'typedi';
import { Config } from '../config';
import { Logger } from '../logger';

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

// const commands = [];

for (const file of commandFiles) {
  // const command = require(`./commands/${file}`);
  // commands.push(command.data.toJSON());
}

const config = Container.get(Config);
const rest = new REST({ version: '9' }).setToken(config.discord.token);

const logger = Container.get(Logger);
// rest
//   .put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), { body: commands })
//   .then(() => logger.info('Successfully registered application commands.'))
//   .catch(logger.error);
