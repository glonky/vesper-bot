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

const boldString = bold('help me please and thanks');
const italicString = italic('the table');
const strikethroughString = strikethrough("it's broken");
const underscoreString = underscore('car');
const spoilerString = spoiler('bar');
const quoteString = quote('tar');
const blockquoteString = blockQuote('far');

export default {
  data: new SlashCommandBuilder().setName('vVSP 101').setDescription(`Introduction to vVSP, the Vesper Governance Pool token`),
  async execute(message: Message) {
    await message.reply(`
    Deposit your VSP to the vVSP pool (link: https://app.vesper.finance/eth/0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc) to share in the performance, growth, and governance of Vesper. Revenue is generated from Vesper platform fees, those funds are used to purchase VSP on the open market, and that VSP is distributed to members of the vVSP pool. Participate in Vesper governance by voting on proposals with your vVSP pool token.

    Read more about:
    - the vVSP pool: https://medium.com/vesperfinance/understanding-vvsp-the-vsp-pool-39bd0cbf249f
    - the Vesper revenue model: https://docs.vesper.finance/vsp-economics/revenue-model
    - governance: https://docs.vesper.finance/community-participation-and-governance/the-voting-process
    
    The More You Know:
    - Once you deposit VSP to the vVSP pool, you will no longer see VSP in your wallet - instead you will have the vVSP token representing your share of the governance pool. You can watch your VSP balance grow by checking the Vesper app.
    - Since your vVSP balance represents your share of the governance pool, it will not track 1:1 with your VSP balance. Your vVSP balance will remain static, the VSP balance it represents will grow as platform revenue is distributed to you.
    `);
  },
};
