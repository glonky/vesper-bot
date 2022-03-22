import Container from 'typedi';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { ethers } from 'ethers';
import _ from 'lodash';
import * as vsp from '@vesper-discord/vesper-service';
import { BaseCommand } from '../base-command';

export default class TestCommand extends BaseCommand {
  static flags = {};

  async runHandler() {
    const addressMetadata = {
      '0x0538C8bAc84E95A9dF8aC10Aad17DbE81b9E36ee': {
        address: '0x0538C8bAc84E95A9dF8aC10Aad17DbE81b9E36ee',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'vaDAI',
        symbol: 'WETH',
      },
      '0x132eEb05d5CB6829Bd34F552cDe0b6b708eF5014': {
        address: '0x132eEb05d5CB6829Bd34F552cDe0b6b708eF5014',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'SushiSwap VSP/ETH LP (SLP) ',
        symbol: 'SLP',
      },
      '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421': {
        address: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'VesperToken',
        symbol: 'VSP',
      },
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'Wrapped BTC',
        symbol: 'WBTC',
      },
      '0x231B7589426Ffe1b75405526fC32aC09D44364c4': {
        address: '0x231B7589426Ffe1b75405526fC32aC09D44364c4',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'Uniswap WBTC/DAI LP (UNI-V2)',
        symbol: 'UNI-V2',
      },
      '0x35864296944119F72AA1B468e13449222f3f0E67': {
        address: '0x35864296944119F72AA1B468e13449222f3f0E67',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'UNKNOWN owned by vesper',
        symbol: 'UNKNOWN',
      },
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'Dai Stablecoin (DAI)',
        symbol: 'DAI',
      },
      '0x7465E30ed5487d62a158625cf38Ae0E9a5Ea733B': {
        address: '0x7465E30ed5487d62a158625cf38Ae0E9a5Ea733B',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'UNKNOWN Owned by vesper',
        symbol: 'WETH',
      },
      '0x75619E9F479f9415630d21dDc99919da47c0a737': {
        address: '0x75619E9F479f9415630d21dDc99919da47c0a737',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'UNKNOWN Owned by vesper',
        symbol: 'WETH',
      },
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
      '0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58': {
        address: '0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'SushiSwap WBTC/ETH LP (SLP) ',
        symbol: 'SLP',
      },
    };
    const etherscanService = Container.get(EtherscanService);
    const proxyAddress = '0x9B11078F5e8345d074498a83C4f9824942F796d3';
    const listOfNormalTransactionsByAddress = await etherscanService.getListOfNormalTransactionsByAddress({
      address: proxyAddress,
      sort: 'desc',
    });
    const { result } = listOfNormalTransactionsByAddress;
    const [firstTransaction] = result;

    const receipt = await etherscanService.getTransactionReceipt(firstTransaction.hash);
    const parsedLogs = await etherscanService.parseTransactionReceiptLogs(receipt);

    const filteredLogs = parsedLogs.filter(Boolean).map((log) => {
      if (!log?.parsedLog) {
        return;
      }
      const filteredArgs = Object.entries(log.parsedLog.args).filter(([key]) => !Number.isInteger(Number(key)));

      const convertedArgs = filteredArgs.reduce((acc, [key, value]) => {
        let finalValue = value;
        if (ethers.BigNumber.isBigNumber(value)) {
          const ether = ethers.utils.formatEther(value.toString());
          const currencyFormatter = new Intl.NumberFormat('en-US', {
            currency: 'USD',
            maximumFractionDigits: 20,
            style: 'currency',
          });

          finalValue = currencyFormatter.format(Number(ether));
        }

        acc[key] = finalValue;

        return acc;
      }, {} as any);

      // this.logger.info('Parsed Log', {
      //   address: log.address,
      //   args: convertedArgs,
      //   name: log.parsedLog.name,
      // });
    });

    // const vesperMetadata = (Container.get(VesperService).vesperLib as any).metadata;
    const vesperMetadata = vsp.metadata;

    const uniqueAddressess = _.chain(parsedLogs).uniqBy('address').map('address').value();
    const addressMetadatas = uniqueAddressess.map((address) => {
      const controller = vesperMetadata.controllers.find((c: any) => c.address === address);
      if (controller) return controller;

      const pool = vesperMetadata.pools.find((p: any) => p.address === address);
      if (pool) return pool;

      const token = vesperMetadata.tokens.find((t: any) => t.address === address);
      if (token) return token;

      const knownAddress = (addressMetadata as any)[address];
      if (knownAddress) return knownAddress;

      this.logger.error('Unknown address', { address });
    });

    this.logger.info('uniqueAddressess', {
      addressMetadatas,
    });
  }
}
