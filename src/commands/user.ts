import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Info about a user')
        .addUserOption((option) => option.setName('target').setDescription('The user')),
    )
    .addSubcommand((subcommand) => subcommand.setName('server').setDescription('Info about the server')),
  async execute(message: Message) {
    await message.reply(`
    Your id: ${message.author.id}
    `);
  },
};
