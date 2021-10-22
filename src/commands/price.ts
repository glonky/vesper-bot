import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import Container from 'typedi';
import { VesperService } from '../services';

export default {
  data: new SlashCommandBuilder().setName('price').setDescription(`Cool prices`),
  async execute(message: Message) {
    const stats = await Container.get(VesperService).getVspStats();
    await message.reply(`
      Price: ${stats.price}
    `);
  },
};
