import {
  SlashCommandBuilder,
  bold,
  italic,
  strikethrough,
  underscore,
  spoiler,
  quote,
  blockQuote,
} from '@discordjs/builders';
import { Message } from 'discord.js';

const boldString = bold('help me');
const italicString = italic('the table');
const strikethroughString = strikethrough("it's broken");
const underscoreString = underscore('car');
const spoilerString = spoiler('bar');
const quoteString = quote('tar');
const blockquoteString = blockQuote('far');

export default {
  data: new SlashCommandBuilder().setName('help').setDescription(`Oh no! The table! It's broken!`),
  async execute(message: Message) {
    await message.reply(`
    ${boldString}
    ${italicString}
    ${strikethroughString}
    ${underscoreString}
    ${spoilerString}
    ${quoteString}
    ${blockquoteString}
    `);
  },
};
