import { ethers, BigNumber } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import { Logger, Log } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { ErrorHandler } from '@vesper-discord/errors';
import { Cacheable } from '@vesper-discord/redis-service';
import type { Filter, BlockTag, Provider } from '@ethersproject/abstract-provider';
import { Retriable } from '@vesper-discord/retry';
import { chunk } from 'lodash';
import { Config } from './config';
import { EthersError, EthersErrorConverter, NotProxyAddressError } from './errors/index';

export interface CallMethodProps {
  methodName: string;
  contractAddress: string;
  abi: any;
  params?: any[];
  readWrite?: 'read' | 'write';
  cache?:
    | {
        ttl?: number;
      }
    | boolean;
}

export interface GetLogsProps {
  contractAddress: string;
}

@Service()
export abstract class BlockchainService {
  @Inject(() => Config)
  protected readonly config!: Config;

  protected abstract readonly logger: Logger;
  public abstract get provider(): Provider;

  /**
   * Prase the transaction receipt to get the log data
   */
  @ErrorHandler({ converter: EthersErrorConverter })
  public parseTransactionLog(contractInterface: ethers.utils.Interface, log: { topics: Array<string>; data: string }) {
    return contractInterface.parseLog(log);
  }

  /**
   * Get the implementation address from a proxy address
   * https://blog.openzeppelin.com/proxy-patterns/
   * https://eips.ethereum.org/EIPS/eip-1967
   * https://ethereum.stackexchange.com/questions/99812/finding-the-address-of-the-proxied-to-address-of-a-proxy
   */
  @Log({ ignoreErrors: [NotProxyAddressError], logInput: ({ input }) => input[0], logResult: ({ result }) => result })
  @Cacheable({
    cacheKey: (args) => args[0],
    ttlSeconds: 60 * 60 * 24,
  })
  @Retriable()
  @ErrorHandler({ converter: EthersErrorConverter })
  public async findImplementationAddressFromProxyAddress(proxyAddress: string) {
    const possibleStorageSlots = ['eip1967.proxy.implementation', 'org.zeppelinos.proxy.implementation'];

    const possibleAddresses = await Promise.all(
      possibleStorageSlots.map(async (storageSlot) => {
        const encodedStorageSlot = keccak256(ethers.utils.toUtf8Bytes(storageSlot));
        let encodedStorageStorageAsNumber = BigNumber.from(encodedStorageSlot);
        if (storageSlot.includes('eip1967')) {
          encodedStorageStorageAsNumber = encodedStorageStorageAsNumber.sub(1);
        }
        const addressInStorage = await this.provider.getStorageAt(
          proxyAddress,
          encodedStorageStorageAsNumber.toHexString(),
        );
        const abiCoder = new ethers.utils.AbiCoder();
        const zeroStrippedAddress = abiCoder.decode(['address'], addressInStorage)[0];
        return zeroStrippedAddress;
      }),
    );

    const address = possibleAddresses.find((result) => result !== undefined && result !== ethers.constants.AddressZero);

    try {
      return ethers.utils.getAddress(address ?? '');
    } catch (err) {
      if ((err as EthersError).code === 'INVALID_ARGUMENT') {
        throw new NotProxyAddressError('Proxy address not found', { address, possibleStorageSlots, proxyAddress });
      }

      throw err;
    }
  }

  @Log({
    logInput: ({ input }) => ({ contractAddress: input[0].contractAddress, methodName: input[0].methodName }),
    logResult: ({ result }) => result,
  })
  @Cacheable({
    cacheKey: (args) => `${args[0].contractAddress}:${args[0].methodName}`,
    noop: (args) => !args[0].cache,
    ttlSeconds: (args) => (args[0].cache && args[0].cache?.ttl ? args[0].cache?.ttl : 60 * 60 * 24),
  })
  @Retriable()
  @ErrorHandler({ converter: EthersErrorConverter })
  public async callMethod({ methodName, contractAddress, abi, readWrite }: CallMethodProps) {
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    return contract[methodName].call();
  }

  @Log({
    logInput: ({ input }) => input[0],
  })
  @Cacheable({
    cacheKey: (args) => `${args[0].address}:${args[0].topics.toString()}:${args[0].fromBlock}:${args[0].toBlock}`,
    ttlSeconds: (args) => (args[0].cache && args[0].cache?.ttl ? args[0].cache?.ttl : 60 * 60 * 24 * 365),
  })
  @Retriable()
  @ErrorHandler({ converter: EthersErrorConverter })
  public async getLogs(filter: Filter & { chunkSize?: number }) {
    try {
      return await this.provider.getLogs(filter);
    } catch (err) {
      if ((err as Error).message.includes('invalid block range')) {
        const latestBlockNumber = filter.toBlock === 'latest' ? await this.provider.getBlockNumber() : filter.toBlock;

        let logs: ethers.providers.Log[] = [];

        const chunkSize = filter.chunkSize ?? 3500;
        const chunks = chunk(Array.from({ length: Number(latestBlockNumber) }), chunkSize);

        await Promise.all(
          chunks.map(async (_chunk, index) => {
            const fromBlock = index * chunkSize;
            const toBlock = fromBlock + chunkSize - 1;
            logs = [...logs, ...(await this.provider.getLogs({ ...filter, fromBlock, toBlock }))];
          }),
        );

        return logs;
      } else {
        throw err;
      }
    }
  }

  @Log({
    logInput: ({ input }) => input[0],
  })
  @Cacheable({
    cacheKey: (args) => args[0],
    ttlSeconds: 60 * 60 * 24,
  })
  @Retriable()
  @ErrorHandler({ converter: EthersErrorConverter })
  public async getBlockInfo(block: BlockTag | string | Promise<BlockTag | string>) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    return this.provider['getBlock'](block);
  }

  @Log({
    logInput: ({ input }) => input[0],
  })
  @Cacheable({
    cacheKey: (args) => args[0],
    ttlSeconds: 60 * 60 * 24,
  })
  @Retriable()
  @ErrorHandler({ converter: EthersErrorConverter })
  public async getTransaction(transactionHash: string) {
    return this.provider.getTransaction(transactionHash);
  }

  /**
   * Returns the transaction receipt for a given transaction hash.
   * @cacheable 5 seconds
   */
  @Log({
    logInput: ({ input }) => input[0].toLowerCase(),
  })
  @Cacheable({
    cacheKey: (args) => args[0].toLowerCase(),
    ttlSeconds: 60 * 60 * 24,
  })
  @Retriable()
  @ErrorHandler({ converter: EthersErrorConverter })
  public async getTransactionReceipt(txhash: string) {
    return this.provider.getTransactionReceipt(txhash);
  }
}
