import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  async execute(message: Message) {
    await message.reply(`
      Server name: ${message.guild?.name}
      Total members: ${message.guild?.memberCount}
      Verification Level: ${message.guild?.verificationLevel}
      Created At: ${message.guild?.createdAt}
    `);
  },
};
