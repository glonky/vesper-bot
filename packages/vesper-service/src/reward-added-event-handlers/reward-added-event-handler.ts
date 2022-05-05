import { BlockchainScanService } from '@vesper-discord/blockchain-scan-service';
import { BlockchainService } from '@vesper-discord/blockchain-service';
import { CoinGeckoService, PlatformId } from '@vesper-discord/coin-gecko-service';
import { PoolRewardEventRepository } from '@vesper-discord/entity-service';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { LogDescription } from 'ethers/lib/utils';
import { BigNumber, ethers } from 'ethers';
import { VesperService } from '../service';
import contracts3_0_23 from '../pools/releases/3.0.23/contracts.json';
import contracts4_0_1 from '../pools/releases/4.0.1/contracts.json';

export interface BackfillProps {
  poolContractVersion?: 3 | 4;
  force?: boolean;
}

@Service()
export abstract class RewardAddedEventHandler {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  @Inject(() => VesperService)
  private vesperService!: VesperService;

  @Inject(() => CoinGeckoService)
  private coinGeckoService!: CoinGeckoService;

  @Inject(() => PoolRewardEventRepository)
  private poolRewardEventRepository!: PoolRewardEventRepository;

  protected abstract readonly blockchainService: BlockchainService;

  protected abstract readonly blockchainScanService: BlockchainScanService;
  protected abstract get network(): string;
  protected abstract get coingeckoPlatformId(): PlatformId;

  public async backfill(props?: BackfillProps) {
    const poolContractVersion = props?.poolContractVersion === 3 ? '3.0.23' : '4.0.1';
    const poolContracts = (
      props?.poolContractVersion === 3 ? contracts3_0_23 : contracts4_0_1
    ) as typeof contracts4_0_1;

    const { networks } = poolContracts;

    const lastEthereumPoolRewardEvent = await this.poolRewardEventRepository.getPoolRewardEventsByNetwork({
      network: this.network,
      poolContractVersion,
    });

    let startingBlockNumber = 0;

    if (!props?.force && lastEthereumPoolRewardEvent.length > 0) {
      startingBlockNumber = Number((lastEthereumPoolRewardEvent[0] as any)?.blockNumber.value) + 1;
    }

    const skippedBecauseRewardTokenIsVSP: any = [];
    const skippedBecauseRewardTokenMissing: any = [];
    const skippedBecauseCouldNotParseLog: any = [];
    await Promise.all(
      Object.entries(networks).map(async ([network, networkPools]) => {
        if (network !== this.network) return;

        return Promise.all(
          Object.entries(networkPools).map(async ([_poolName, poolDefinition]) => {
            if (poolDefinition.poolRewards) {
              const vesperPools = await this.vesperService.getPools();
              const vesperPool = vesperPools.find((pool) => pool.address === poolDefinition.pool.proxy);

              const poolRewardsProxyContractAddress = poolDefinition.poolRewards.proxy;

              const poolRewardsProxyContract = await this.blockchainScanService.getContractFromAddress(
                poolRewardsProxyContractAddress,
              );

              const filter = poolRewardsProxyContract.filters.RewardAdded();
              const latestBlockNumber = await this.blockchainService.provider.getBlockNumber();
              const logs = await this.blockchainService.getLogs({
                ...filter,
                fromBlock: startingBlockNumber === 0 ? vesperPool?.birthblock : startingBlockNumber,
                toBlock: latestBlockNumber,
              });

              const parsedLogs = await Promise.all(
                logs.map(async (log) => {
                  let parsedLog: LogDescription | undefined;

                  try {
                    parsedLog = this.blockchainService.parseTransactionLog(poolRewardsProxyContract.interface, log);
                  } catch (e) {
                    this.logger.error('error parsing log', { error: e as Error });
                    skippedBecauseCouldNotParseLog.push(log);
                    return null;
                  }

                  return {
                    ...log,
                    block: await this.blockchainService.getBlockInfo(log.blockNumber),
                    parsedLog,
                    transaction: await this.blockchainService.getTransaction(log.transactionHash),
                  };
                }),
              );

              const filteredLogs = parsedLogs.filter(Boolean);

              const poolProxyContract = await this.blockchainScanService.getContractFromAddress(
                poolDefinition.pool.proxy,
              );
              const strategyAddresses = await poolProxyContract.getStrategies();

              await Promise.all(
                filteredLogs.map(async (rewardAddedEvent) => {
                  const strategyAddress = strategyAddresses.find(
                    (address: string) => address === rewardAddedEvent?.transaction.to,
                  );

                  let strategyName;

                  if (strategyAddress) {
                    const strategyContract = await this.blockchainScanService.getContractFromAddress(strategyAddress);

                    strategyName = await strategyContract.NAME();
                  }

                  const poolContract = await this.blockchainScanService.getContractFromAddress(
                    poolDefinition.pool.proxy,
                  );
                  const poolName = await poolContract.name();

                  const rewardTokenPoolAddress = rewardAddedEvent?.parsedLog.args?.rewardToken as string;

                  if (!rewardTokenPoolAddress) {
                    skippedBecauseRewardTokenMissing.push(rewardAddedEvent);
                    return;
                  }

                  const rewardTokenPoolContract = await this.blockchainScanService.getContractFromAddress(
                    rewardTokenPoolAddress,
                  );

                  let rewardTokenPoolName = await rewardTokenPoolContract.name();
                  const rewardTokenSymbol = await rewardTokenPoolContract.symbol();
                  const rewardTokenDecimals = await rewardTokenPoolContract.decimals();
                  let baseTokenAddress = rewardTokenPoolAddress;

                  const rewardAmount = rewardAddedEvent?.parsedLog.args?.reward as BigNumber;
                  // TODO: Should we be calling format units with baseTokenDecimals here?
                  const rewardAmountFormatted = ethers.utils.formatUnits(rewardAmount ?? 0, rewardTokenDecimals);

                  const rewardDuration = rewardAddedEvent?.parsedLog.args?.rewardDuration?.toBigInt() ?? 0;

                  if (rewardTokenSymbol === 'VSP') {
                    this.logger.debug('Skipping because of VSP');
                    skippedBecauseRewardTokenIsVSP.push(rewardAddedEvent);
                    rewardTokenPoolName = 'vVSP pool';
                  } else if (typeof rewardTokenPoolContract.token === 'function') {
                    baseTokenAddress = await rewardTokenPoolContract.token();
                  }

                  // TODO: Maybe wrap .call() methods in a try/catch block and log the error
                  // TODO: maybe warap .call() methods in blockchain service so we can track performance and cache calls
                  const baseTokenContract = await this.blockchainScanService.getContractFromAddress(baseTokenAddress);
                  const baseTokenName = await baseTokenContract.name();
                  const baseTokenSymbol = await baseTokenContract.symbol();

                  const baseTokenValue = ethers.utils.formatUnits(vesperPool?.tokenValue ?? 0);
                  const baseTokenTotalValueLocked = ethers.utils.formatEther(vesperPool?.totalValue ?? 0);

                  const baseTokenPrice = await this.coinGeckoService.getPriceOfToken({
                    contractAddresses: [baseTokenAddress],
                    platformId: this.coingeckoPlatformId,
                    vsCurrencies: ['USD'],
                  });
                  const baseTokenPriceInUSD = Number(Object.values(baseTokenPrice)[0].usd);
                  const baseTokenAmount = Number(baseTokenValue) * Number(rewardAmountFormatted); // WBTC
                  const baseTokenAmountInUSD = baseTokenAmount * baseTokenPriceInUSD;

                  const id = rewardAddedEvent?.transactionHash;
                  // TODO:
                  // Add holders, interest earned so far
                  // TODO: Create snapshot of pool state at interval as well as snapshot of pool state at end of reward period
                  // TODO: Add extra metadata around pool like risk level and pool type. Agressive, conservative, earn, grow from vesper api
                  // https://ethereum.stackexchange.com/questions/41684/api-to-gather-list-of-top-token-holders
                  // Create compound sk for reward to include transaction and somthing else

                  await this.poolRewardEventRepository.putItem({
                    GSI2pk: strategyName ? `POOL_STRATEGY#${strategyName}` : undefined,
                    GSI2sk: strategyName
                      ? `POOL_REWARD_EVENT#BLOCK_NUMBER#${rewardAddedEvent?.blockNumber}#ID#${id}`
                      : undefined,
                    GSI3pk: `NETWORK#${this.network}`,
                    GSI3sk: `POOL_REWARD_EVENT#BLOCK_NUMBER#${rewardAddedEvent?.blockNumber}#ID#${id}`,
                    baseTokenAddress,
                    baseTokenAmount,
                    baseTokenAmountInUSD,
                    baseTokenName,
                    baseTokenPriceInUSD,
                    baseTokenSymbol,
                    baseTokenTotalValueLocked,
                    baseTokenValue,
                    blockNumber: rewardAddedEvent?.blockNumber,
                    blockTimestamp: rewardAddedEvent?.block.timestamp,
                    id,
                    network: this.network,
                    pk: `POOL#${poolName}`,
                    poolAssetAddress: vesperPool?.asset.address,
                    poolAssetCurrency: vesperPool?.asset.currency,
                    poolAssetDecimals: vesperPool?.asset.decimals,
                    poolAssetPrice: vesperPool?.asset.price,
                    poolAssetSymbol: vesperPool?.asset.symbol,
                    poolAssetTotalValueLocked: vesperPool?.totalValue,
                    poolContractVersion,
                    poolHolders: vesperPool?.holders,
                    poolInterestFee: vesperPool?.interestFee,
                    poolLogoURI: vesperPool?.logoURI,
                    poolName: poolName,
                    poolProxyContractAddress: poolDefinition.pool.proxy,
                    poolRewardsProxyContractAddress,
                    poolType: vesperPool?.type,
                    poolWithdrawFee: vesperPool?.withdrawFee,
                    rewardAmount: rewardAmountFormatted,
                    rewardDuration,
                    rewardTokenPoolAddress,
                    rewardTokenPoolName,
                    rewardTokenSymbol,
                    sk: `POOL_REWARD_EVENT#BLOCK_NUMBER#${rewardAddedEvent?.blockNumber}#ID#${id}`,
                    strategyAddress,
                    strategyName,
                    transactionId: rewardAddedEvent?.transactionHash,
                    type: 'POOL_REWARD_EVENT',
                  } as any);
                }),
              );
            }
          }),
        );
      }),
    );
  }
}
