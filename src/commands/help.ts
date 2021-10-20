import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('help').setDescription(`Oh no! The table! It's broken!`),
  async execute(message: Message) {
    await message.reply('Help!');
  },
};
