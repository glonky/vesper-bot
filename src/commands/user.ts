import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
  async execute(message: Message) {
    // await message.reply(`
    // Your tag: ${message.user?.tag}
    // Your id: ${message.user?.id}
    // `);
  },
};
