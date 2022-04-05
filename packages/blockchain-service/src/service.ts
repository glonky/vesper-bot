import Web3 from 'web3';
import { ethers, BigNumber } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import { LoggerDecorator, Logger, Log } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { ErrorHandler } from '@vesper-discord/errors';
import { Cacheable } from '@vesper-discord/redis-service';
import type { Filter, FilterByBlockHash, BlockTag } from '@ethersproject/abstract-provider';
import { Config } from './config';
import { EthersError, EthersErrorConverter, NotProxyAddressError } from './errors';

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
export class BlockchainService {
  @LoggerDecorator()
  public logger!: Logger;

  @Inject(() => Config)
  private config!: Config;

  public get web3() {
    const infuraUrl = `https://${this.config.network}.infura.io/v3/${this.config.infura.project.id}`;
    const httpProvider = new Web3.providers.HttpProvider(infuraUrl);
    return new Web3(httpProvider);
  }

  public get ethersProvider() {
    return new ethers.providers.InfuraProvider(this.config.network, {
      projectId: this.config.infura.project.id,
      projectSecret: this.config.infura.project.secret,
    });
  }

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
        const addressInStorage = await this.ethersProvider.getStorageAt(
          proxyAddress,
          encodedStorageStorageAsNumber.toHexString(),
        );
        const zeroStrippedAddress = ethers.utils.hexStripZeros(addressInStorage);
        return zeroStrippedAddress;
      }),
    );

    const address = possibleAddresses.find((result) => result !== undefined);

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
  public async callMethod({ methodName, contractAddress, abi, readWrite }: CallMethodProps) {
    const contract = new ethers.Contract(contractAddress, abi, this.ethersProvider);
    return contract[methodName].call();
  }

  @Log({
    logInput: ({ input }) => input[0],
  })
  @Cacheable({
    cacheKey: (args) => `${args[0].contractAddress}:${args[0].methodName}`,
    ttlSeconds: (args) => (args[0].cache && args[0].cache?.ttl ? args[0].cache?.ttl : 60 * 60 * 24),
  })
  public async getLogs(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>) {
    return this.ethersProvider.getLogs(filter);
  }

  @Log({
    logInput: ({ input }) => input[0],
  })
  @Cacheable({
    cacheKey: (args) => args[0],
    ttlSeconds: 60 * 60 * 24,
  })
  public async getBlockInfo(block: BlockTag | string | Promise<BlockTag | string>) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    return this.ethersProvider['getBlock'](block);
  }
}
