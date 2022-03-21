import Container from 'typedi';
import { EtherscanService } from '../service';

describe('etherscan-service | service | e2e', () => {
  describe('getListOfNormalTransactionsByAddress', () => {
    it.skip('should response with 200', async () => {
      const etherscanService = Container.get(EtherscanService);
      const proxyAddress = '0x9B11078F5e8345d074498a83C4f9824942F796d3';
      const contractAddress = '0x9B11078F5e8345d074498a83C4f9824942F796d3';
      const listOfNormalTransactionsByAddress = await etherscanService.getListOfNormalTransactionsByAddress({
        address: proxyAddress,
        sort: 'desc',
      });
      const { result } = listOfNormalTransactionsByAddress;
      const [firstTransaction] = result;

      const asdf = await etherscanService.getListOfERC20TokenTransferEventsByAddress({
        // address: '0x9B11078F5e8345d074498a83C4f9824942F796d3',
        address: '0x76d266dfd3754f090488ae12f6bd115cd7e77ebd',
        // contractAddress: '0x7465E30ed5487d62a158625cf38Ae0E9a5Ea733B',
        // contractAddress: '0x9B11078F5e8345d074498a83C4f9824942F796d3',
        // endblock: Number(firstTransaction.blockNumber),
        sort: 'desc',
        // startblock: Number(firstTransaction.blockNumber),
      });

      const logs = await etherscanService.getTransactionReceipt(firstTransaction.hash);
      // console.log('result of the thiansdflkajsdflaks df', asdf.result);
      // const f = asdf.result.filter(
      //   (tokenTransferEvent) => tokenTransferEvent.to === ('0x7465E30ed5487d62a158625cf38Ae0E9a5Ea733B' as any),
      // );
      console.log(logs);
      expect(result).toBe(200);
    }, 100000);
  });
});
