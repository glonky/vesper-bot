import { BigNumber } from 'bignumber.js';
import { Container } from 'typedi';
import web3 from 'web3';
import { formatTimeFromSeconds, unwrap } from '@vesper-discord/utils';
import { CustomSlashCommandBuilder, discord } from '@vesper-discord/discord-service';
import { EtherscanService } from '@vesper-discord/blockchain-scan-service';
import { Config } from '../config';

export default {
  data: new CustomSlashCommandBuilder()
    .setName('eth')
    .setEnabled(!Container.get(Config).isProduction)
    .setDescription(`List ETH Price`)
    .setExecute(async ({ interaction }) => {
      return interaction.reply('Eth price');
    })
    .addCustomSubcommand((subcommand) =>
      subcommand
        .setName('gas')
        .setDescription(`List Ethereum Gas Priority Fees from Etherscan Oracle`)
        .setExecute(async ({ interaction }) => {
          await interaction.deferReply();

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

          const messageEmbed = new discord.MessageEmbed()
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
                value: unwrap`${new BigNumber(gasOracle.result.FastGasPrice).toFormat()} Gwei
                ${formatTimeFromSeconds(fastEstimationOfConfirmationTime.result)}`,
              },
              {
                inline: true,
                name: 'Proposed',
                value: unwrap`${new BigNumber(gasOracle.result.ProposeGasPrice).toFormat()} Gwei
                ${formatTimeFromSeconds(proposedEstimationOfConfirmationTime.result)}`,
              },
              {
                inline: true,
                name: 'Safe',
                value: unwrap`${new BigNumber(gasOracle.result.SafeGasPrice).toFormat()} Gwei
                ${formatTimeFromSeconds(safeEstimationOfConfirmationTime.result)}`,
              },
              {
                name: 'Suggested Base Fee',
                value: unwrap`${new BigNumber(gasOracle.result.suggestBaseFee).toFormat(0)} Gwei
                ${formatTimeFromSeconds(suggestedEstimationOfConfirmationTime.result)}`,
              },
            )
            .setFooter(
              'Etherscan Gas Tracker',
              'https://etherscan.io/images/brandassets/etherscan-logo-light-circle.png',
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [messageEmbed] });
        }),
    ),
};
