import BigNumber from 'bignumber.js';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Container from 'typedi';
import web3 from 'web3';
import pluralize from 'pluralize';
import { SlashCommandBuilder } from '../builders';
import { EtherscanService } from '../services';

export default {
  data: new SlashCommandBuilder()
    .setName('eth')
    .setDescription(`List ETH Price`)
    .setExecute(async (interaction: CommandInteraction) => {
      return interaction.reply('Eth price');
    })
    .addSubcommand((subcommand) =>
      subcommand
        .setName('gas')
        .setDescription(`List Ethereum Gas Priority Fees from Etherscan Oracle`)
        .setExecute(async (interaction: CommandInteraction) => {
          const etherscanService = Container.get(EtherscanService);

          const gasOracle = await etherscanService.getGasOracle();
          const [
            fastEstimationOfConfirmationTime,
            safeEstimationOfConfirmationTime,
            proposedEstimationOfConfirmationTime,
            suggestedEstimationOfConfirmationTime,
          ] = await Promise.all([
            etherscanService.getEstimationOfConfirmationTime(web3.utils.toWei(gasOracle.result.FastGasPrice, 'Gwei')),
            etherscanService.getEstimationOfConfirmationTime(web3.utils.toWei(gasOracle.result.SafeGasPrice, 'Gwei')),
            etherscanService.getEstimationOfConfirmationTime(
              web3.utils.toWei(gasOracle.result.ProposeGasPrice, 'Gwei'),
            ),
            etherscanService.getEstimationOfConfirmationTime(web3.utils.toWei(gasOracle.result.suggestBaseFee, 'Gwei')),
          ]);

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Ethereum Gas Priority Fees')
            .setThumbnail('https://etherscan.io/images/ethereum-icon.png')
            .setURL('https://etherscan.io/gastracker')
            .setDescription(
              'The following are the Gas Priority Fees and an estimate of how long for a transaction to be confirmed on the blockchain respectively.',
            )
            .addFields(
              {
                inline: true,
                name: 'Fast',
                value: `${new BigNumber(gasOracle.result.FastGasPrice).toFormat()} Gwei - ${formatTimeFromSeconds(
                  fastEstimationOfConfirmationTime.result,
                )}`,
              },
              {
                inline: true,
                name: 'Proposed',
                value: `${new BigNumber(gasOracle.result.ProposeGasPrice).toFormat()} Gwei - ${formatTimeFromSeconds(
                  proposedEstimationOfConfirmationTime.result,
                )}`,
              },
              {
                inline: true,
                name: 'Safe',
                value: `${new BigNumber(gasOracle.result.SafeGasPrice).toFormat()} Gwei - ${formatTimeFromSeconds(
                  safeEstimationOfConfirmationTime.result,
                )}`,
              },
              {
                name: 'Suggested Base Fee',
                value: `${new BigNumber(gasOracle.result.suggestBaseFee).toFormat(0)} Gwei - ${formatTimeFromSeconds(
                  suggestedEstimationOfConfirmationTime.result,
                )}`,
              },
            )
            .setFooter(
              'Etherscan Gas Tracker',
              'https://etherscan.io/images/brandassets/etherscan-logo-light-circle.png',
            )
            .setTimestamp();

          await interaction.reply({ embeds: [messageEmbed] });
        }),
    ),
};

function formatTimeFromSeconds(seconds: number | string) {
  const secondsAsNumber = Number(seconds);
  const hours = Math.floor(secondsAsNumber / 3600);
  const minutes = Math.floor((secondsAsNumber % 3600) / 60);
  const secondsLeft = Math.floor(secondsAsNumber % 60);

  let formattedTime = '';
  if (hours > 0) {
    formattedTime += `${hours} ${pluralize('hour', hours)} `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes} ${pluralize('min', minutes)} `;
  }
  if (secondsLeft > 0) {
    formattedTime += `${secondsLeft} ${pluralize('sec', secondsLeft)}`;
  }

  return formattedTime;
}
