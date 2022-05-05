import { Container } from 'typedi';
import { CoinGeckoService, PlatformId } from '../service';

describe('coin-gecko-service | service | e2e', () => {
  const wbtcAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';

  describe('getCoinInfoFromContractAddress', () => {
    it('should return the correct coin info', async () => {
      const coinGeckoService = Container.get(CoinGeckoService);
      const coinInfo = await coinGeckoService.getCoinInfoFromContractAddress({
        contractAddress: wbtcAddress,
        platformId: PlatformId.ETHEREUM,
      });
      expect(coinInfo.symbol).toBe('wbtc');
    });
  });

  describe('getPriceOfToken', () => {
    it('should return the correct price', async () => {
      const coinGeckoService = Container.get(CoinGeckoService);
      const priceOfToken = await coinGeckoService.getPriceOfToken({
        contractAddresses: [wbtcAddress], // WBTC
        platformId: PlatformId.ETHEREUM,
        vsCurrencies: ['usd'],
      });

      expect(Object.values(priceOfToken)[0].usd).toBeTruthy();
    });
  });
});
