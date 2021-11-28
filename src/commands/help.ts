import { bold, hideLinkEmbed, hyperlink } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '../builders';
import { Config } from '../config';
import { unwrap } from '../utils';

const config = Container.get(Config);

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(`Learn more about Vesper.`)
    .setRestrictToChannels([config.discord.channels.admin])
    .setRestrictToRoles([
      { allowed: true, id: config.discord.roles.everyone },
      { allowed: true, id: config.discord.roles.testRestricted },
    ])
    .setRateLimit()
    .addSubcommand((subcommand) =>
      subcommand
        .setName('vvsp')
        .setDescription('Introduction to vVSP, the Vesper Governance Pool token')
        .setExecute(async (interaction: CommandInteraction) => {
          const content = unwrap`
          Deposit your VSP to the ${hyperlink(
            'vVSP pool',
            hideLinkEmbed('https://app.vesper.finance/eth/0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc'),
          )} to share in the performance, growth, and governance of Vesper.

          Revenue is generated from Vesper platform fees, those funds are used to purchase VSP on the open market, and that VSP is distributed to members of the vVSP pool.

          Participate in Vesper governance by voting on proposals with your vVSP pool token.

          :book: ${bold('Read more about')}

          - ${hyperlink(
            'The vVSP pool',
            hideLinkEmbed('https://medium.com/vesperfinance/understanding-vvsp-the-vsp-pool-39bd0cbf249f'),
          )}
          - ${hyperlink(
            'The Vesper revenue model',
            hideLinkEmbed('https://docs.vesper.finance/vsp-economics/revenue-model'),
          )}
          - ${hyperlink(
            'Governance',
            hideLinkEmbed('https://docs.vesper.finance/community-participation-and-governance/the-voting-process'),
          )}

          :bulb: ${bold('The More You Know')}

           - Once you deposit VSP to the vVSP pool, you will no longer see VSP in your wallet - instead you will have the vVSP token representing your share of the governance pool. You can watch your VSP balance grow by checking the Vesper app.

           - Since your vVSP balance represents your share of the governance pool, it will not track 1:1 with your VSP balance. Your vVSP balance will remain static, the VSP balance it represents will grow as platform revenue is distributed to you.
          `;

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Introduction to vVSP, the Vesper Governance Pool token')
            .setDescription(content)
            .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png');

          await interaction.reply({
            embeds: [messageEmbed],
          });
        }),
    ),
};
