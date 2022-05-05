import { Container } from 'typedi';
import { ethers } from 'ethers';
import { RedisService } from '@vesper-discord/redis-service';
import { NotProxyAddressError } from '../errors/index';
import { EthereumBlockchainService } from '../ethereum-service';
let redisClient: any;
beforeAll(async () => {
  redisClient = Container.get(RedisService).init();
});
afterAll(async () => {
  redisClient?.quit();
});

describe('ethereum-blockchain-service | e2e', () => {
  describe('findImplementationAddressFromProxyAddress', () => {
    const proxyAddress = '0x01e1d41c1159b745298724c5fd3eaff3da1c6efd';

    it('should response with the correct address', async () => {
      const ethereumBlockchainService = Container.get(EthereumBlockchainService);
      const expectedImplementationAddress = '0xfaed291aba8c0f7daae17c0176ccc398d9284fd5';
      const actualImplementationAddress = await ethereumBlockchainService.findImplementationAddressFromProxyAddress(
        proxyAddress,
      );
      expect(actualImplementationAddress.toLowerCase()).toBe(expectedImplementationAddress.toLowerCase());
    });

    it('should throw NotProxyAddressError if it is not a proxy address', async () => {
      const ethereumBlockchainService = Container.get(EthereumBlockchainService);
      await expect(() =>
        ethereumBlockchainService.findImplementationAddressFromProxyAddress(ethers.constants.AddressZero),
      ).rejects.toThrow(NotProxyAddressError);
    });
  });

  describe('getTransactionReceipt', () => {
    it('should respond with the correct result', async () => {
      const ethereumBlockchainService = Container.get(EthereumBlockchainService);
      const receipt = await ethereumBlockchainService.getTransactionReceipt(
        '0xdacecfa6f6ed7ae545b3895b99e953f9b5f90f6a31666da4bbc564558eec290c',
      );
      expect(receipt.to).toBe('0xD9e153F629A55992f5Fc699442e50E386e3336B0');
      expect(receipt.from).toBe('0x76d266DFD3754f090488ae12F6Bd115cD7E77eBD');
      expect(receipt.logs).toHaveLength(25);
    });
  });
});
