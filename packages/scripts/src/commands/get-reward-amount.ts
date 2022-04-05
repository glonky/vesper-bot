import fs from 'fs';
import path from 'path';
import { flags } from '@oclif/command';
import Container from 'typedi';
import { Duration } from 'luxon';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { Logger } from '@vesper-discord/logger';
import { BigNumber, ethers } from 'ethers';
import semverSort from 'semver-sort';
import { VesperService } from '@vesper-discord/vesper-service';
import { CoinGeckoService } from '@vesper-discord/coin-gecko-service';
import { BaseCommand } from '../base-command';

interface VesperPoolContractReleasePool {
  implementation: string;
  poolAccountant: {
    proxyAdmin: string;
    proxy: string;
    implementation: string;
  };
  proxy: string;
  proxyAdmin: string;
}

interface VesperPoolContractReleasePoolRewards {
  implementation: string;
  proxy: string;
  proxyAdmin: string;
}

interface VesperPoolContractReleasePoolMetadata {
  [poolName: string]: {
    pool: VesperPoolContractReleasePool;
    poolRewards?: VesperPoolContractReleasePoolRewards;
    strategies: {
      [strategyName: string]: string;
    };
  };
}

interface VesperPoolContractReleases {
  networks: {
    [network: string]: VesperPoolContractReleasePoolMetadata;
  };
  version: string;
}
export default class CallBlockchainMethodCommand extends BaseCommand {
  static flags = {
    contractAddress: flags.string({
      char: 'a',
      description: 'The contract address to call the method.',
    }),

    transaction: flags.string({
      char: 't',
      description: 'The transaction hash to find the reward amount for.',
    }),

    vesperPoolVersion: flags.string({
      char: 'v',
      description: 'The vesper pool version to check.',
    }),
  };

  async runHandler() {
    const { flags: cliFlags } = this.parse(CallBlockchainMethodCommand);
    const { contractAddress, transaction, vesperPoolVersion } = cliFlags;
    let finalVesperPoolVersion = vesperPoolVersion;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vesperPoolsReleaseDirectory = path.join(__dirname, '../../../../node_modules/vesper-pools/releases');
    if (!finalVesperPoolVersion) {
      const vesperPoolReleases = fs.readdirSync(vesperPoolsReleaseDirectory);
      const sortedVesperPoolVersions = semverSort.desc(vesperPoolReleases);
      const [latestVesperPoolVersion] = sortedVesperPoolVersions;
      finalVesperPoolVersion = latestVesperPoolVersion;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const contractJson = require(path.join(
      vesperPoolsReleaseDirectory,
      finalVesperPoolVersion,
      'contracts.json',
    )) as VesperPoolContractReleases;
    const { networks } = contractJson;
    const contract = '';
    Object.entries(networks).forEach(([network, networkPools]) => {
      Object.entries(networkPools).forEach(([poolName, poolDefinition]) => {
        // if (poolDefinition.strategies === '') {
        // contract = poolDefinition.pool.implementation;
        // }
      });
    });

    const vesperService = Container.get(VesperService);
    // const pool =
    const etherscanService = Container.get(EtherscanService);
    const coinGeckoService = Container.get(CoinGeckoService);
    const logger = Container.get(Logger);
    // const earnVesperStrategyDAIWBTC = '0x9B11078F5e8345d074498a83C4f9824942F796d3';
    if (transaction) {
      const receipt = await etherscanService.getTransactionReceipt(transaction);
      const parsedLogs = await etherscanService.parseTransactionReceiptLogs(receipt);
      const rewardAddedEvent = parsedLogs.find((log) => log?.parsedLog.name === 'RewardAdded');
      const rewardAmount = rewardAddedEvent?.parsedLog.args?.reward as BigNumber;
      const rewardAmountFormatted = ethers.utils.formatEther(rewardAmount);
      const rewardTokenPoolAddress = rewardAddedEvent?.parsedLog.args?.rewardToken as string;
      const rewardDurationInDays = Duration.fromObject({
        seconds: rewardAddedEvent?.parsedLog.args.rewardDuration,
      }).as('days');
      const rewardTokenPoolContract = await etherscanService.getContractFromAddress(rewardTokenPoolAddress);

      const poolName = await rewardTokenPoolContract.name.call();
      const baseTokenSymbol = await rewardTokenPoolContract.symbol.call();
      const baseTokenAddress = await rewardTokenPoolContract.token.call();

      // TODO: Maybe wrap .call() methods in a try/catch block and log the error
      // TODO: maybe warap .call() methods in blockchain service so we can track performance and cache calls
      const baseTokenContract = await etherscanService.getContractFromAddress(baseTokenAddress);
      const baseTokenName = await baseTokenContract.name.call();
      const baseTokenDecimals = await baseTokenContract.decimals.call();

      const totalValue = await rewardTokenPoolContract.totalValue.call();

      const foo = ethers.utils.formatUnits(totalValue, baseTokenDecimals);
      const vesperPools = await vesperService.getPools();
      const vesperPool = vesperPools.find((pool) => pool.poolName === poolName);

      const tokenValue = ethers.utils.formatUnits(vesperPool?.tokenValue ?? 0, baseTokenDecimals);
      const totalValueLock = ethers.utils.formatUnits(vesperPool?.totalValue ?? 0, baseTokenDecimals);
      const priceOfBaseToken = await coinGeckoService.getPriceOfToken({
        contractAddresses: [baseTokenAddress],
        platformId: 'ethereum',
        vsCurrencies: ['USD'],
      });

      const usdValueOfBaseToken = Object.values(priceOfBaseToken)[0].usd;
      const amountOfUnderlyingAsset = Number(rewardAmountFormatted) * Number(tokenValue); // WBTC
      const amountOfUnderlyingAssetInUSD = amountOfUnderlyingAsset * usdValueOfBaseToken;
      const totalValueLockUsd = Number(totalValueLock) * usdValueOfBaseToken;

      logger.info('Rebalance', {
        amountOfUnderlyingAsset,
        amountOfUnderlyingAssetInUSD,
        baseTokenName,
        baseTokenSymbol,
        etherscanTxUrl: `https://etherscan.io/tx/${transaction}`,
        network: 'Ethereum',
        poolName,
        rewardAmount: rewardAmountFormatted,
        rewardDurationInDays,
        rewardTokenAddress: rewardTokenPoolAddress,
        tokenValue,
        totalValueLock,
        totalValueLockUsd,
        transaction,
      });
    }
  }
}
