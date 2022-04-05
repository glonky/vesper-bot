import Container from 'typedi';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { ethers } from 'ethers';
import * as vsp from '@vesper-discord/vesper-service';
import _ from 'lodash';
import { BaseCommand } from '../base-command';

export default class TestCommand extends BaseCommand {
  static flags = {};

  async runHandler() {
    let addressMetadata = {
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
        name: 'UNKNOWN owned by vesper 0x35864296944119F72AA1B468e13449222f3f0E67',
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
        name: 'UNKNOWN Owned by vesper 0x7465E30ed5487d62a158625cf38Ae0E9a5Ea733B',
        symbol: 'WETH',
      },
      '0x75619E9F479f9415630d21dDc99919da47c0a737': {
        address: '0x75619E9F479f9415630d21dDc99919da47c0a737',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'UNKNOWN Owned by vesper 0x75619E9F479f9415630d21dDc99919da47c0a737',
        symbol: 'WETH',
      },
      '0x9b11078f5e8345d074498a83c4f9824942f796d3': {
        address: '0x9b11078f5e8345d074498a83c4f9824942f796d3',
        chainId: 1,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/vesperfi/metadata/master/src/logos/vsp.svg',
        name: 'EarnVesperStrategyDAIWBTC',
        symbol: 'EarnVesperStrategyDAIWBTC',
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
    } as any;
    const etherscanService = Container.get(EtherscanService);
    const proxyAddress = '0x9B11078F5e8345d074498a83C4f9824942F796d3';
    const listOfNormalTransactionsByAddress = await etherscanService.getListOfNormalTransactionsByAddress({
      address: proxyAddress,
      sort: 'desc',
    });
    const { result } = listOfNormalTransactionsByAddress;
    const [firstTransaction, second] = result;

    const receipt = await etherscanService.getTransactionReceipt(second.hash);
    const parsedLogs = await etherscanService.parseTransactionReceiptLogs(receipt);

    function populateKnownAddresses() {
      const vesperMetadata = vsp.metadata;

      vesperMetadata.controllers.forEach(
        (c) => ((addressMetadata as any)[c.address] = { ...c, address: c.address.toLowerCase() }),
      );

      vesperMetadata.pools.forEach(
        (c) => ((addressMetadata as any)[c.address] = { ...c, address: c.address.toLowerCase() }),
      );
      vesperMetadata.tokens.forEach(
        (c) => ((addressMetadata as any)[c.address] = { ...c, address: c.address.toLowerCase() }),
      );

      addressMetadata = _.mapKeys(addressMetadata, (v, k) => k.toLowerCase()) as any;
    }

    populateKnownAddresses();

    function findAndUpdateAddressMetadata(address: string) {
      try {
        const lowerCaseAddress = address.toLowerCase();
        const knownAddress = (addressMetadata as any)[lowerCaseAddress];
        if (knownAddress) return knownAddress;
      } catch (err) {
        console.error(err);
      }

      return null;
    }

    parsedLogs.filter(Boolean).map((log) => {
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

      if (log.parsedLog.name === 'Transfer') {
        const metadata = findAndUpdateAddressMetadata(log.address) ?? { name: 'Zero' };
        const from = findAndUpdateAddressMetadata(convertedArgs.from ?? convertedArgs.dst) ?? { name: 'Zero' };
        const to = findAndUpdateAddressMetadata(convertedArgs.to ?? convertedArgs.src) ?? { name: 'Zero' };

        this.logger.info('Transfer', {
          address: metadata.name,
          amount: convertedArgs.value ?? convertedArgs.wad,
          from: from?.name,
          to: to?.name,
          type: log.parsedLog.eventFragment.type,
        });
      } else {
        this.logger.debug('Parsed Log', {
          address: log.address,
          args: convertedArgs,
          name: log.parsedLog.name,
          type: log.parsedLog.eventFragment.type,
        });
      }
    });

    // const vesperMetadata = (Container.get(VesperService).vesperLib as any).metadata;

    // const uniqueAddressess = _.chain(parsedLogs).uniqBy('address').map('address').value();
    // const addressMetadatas = uniqueAddressess.map((address) => {});

    // this.logger.info('uniqueAddressess', {
    // addressMetadatas,
    // });
  }
}
