import {
  CustomSlashCommandBuilder,
  CommandInteraction,
  hyperlink,
  hideLinkEmbed,
  bold,
  MessageEmbed,
} from '@vesper-discord/discord-service';
import { unwrap } from '@vesper-discord/utils';

export default {
  data: new CustomSlashCommandBuilder()
    .setName('help')
    .setDescription(`Learn more about Vesper.`)
    .addCustomSubcommand((subcommand) =>
      subcommand
        .setName('vvsp')
        .setRestrictToChannels([
          '916121841783951390', // help
          '916121858166906930', // resources
          '916121989117280276', //q-and-a
        ])
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

           - Since your vVSP balance represents your share of the governance pool, it will not track 1:1 with your VSP balance. Your vVSP balance will remain static, the VSP balance it represents will grow as platform revenue is distributed to you. To see the current exchange rate of VSP to vVSP, you can use the \`/vsp exchange-rate\` command.
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
