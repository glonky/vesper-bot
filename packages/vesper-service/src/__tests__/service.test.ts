import { Container } from 'typedi';
import { EthereumVesperService } from '..';

describe('vesper-service | service | e2e', () => {
  describe('getListOfNormalTransactionsByAddress', () => {
    it.skip('should response with 200', async () => {
      const vesperService = Container.get(EthereumVesperService);
      // const contracts = await vesperService.vesperLib.getContracts();
      // contracts.assetContracts.forEach(async (assetContract) => {
      // assetContract.
      // });
      // console.log(await vesperService.vesperLib.getAssetPortfolio('0xAe5bBC043b0472E49687820B2A1197AE63490150'));
      // console.log(await vesperService.vesperLib.getPortfolio('0xAe5bBC043b0472E49687820B2A1197AE63490150'));
      // console.log(await vesperService.vesperLib.eth.getBalance());
      // const assetContract = await vesperService.vesperLib.vVSP.getAssetBalance();
      // console.log(await assetContract.methods.name().call());

      expect(true).toBe(false);
    });
  });
});
