import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('help').setDescription('Replies with Help!'),
  async execute(message: Message) {
    await message.reply('Help!');
  },
};
