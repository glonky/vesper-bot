import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  async execute(message: Message) {
    await message.reply('Pong!');
  },
};
