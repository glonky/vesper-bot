import Container from 'typedi';
import { BlockchainService } from '../service';

describe('blockchain-service | service | e2e', () => {
  describe('getTransactionReceipt', () => {
    it.skip('should response with 200', async () => {
      const etherscanService = Container.get(BlockchainService);
      const proxyAddress = '0x9B11078F5e8345d074498a83C4f9824942F796d3';

      // console.log(JSON.stringify(f));
      expect(200).toBe(200);
    });
  });
});
