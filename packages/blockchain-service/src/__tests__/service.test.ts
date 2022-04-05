import Container from 'typedi';
import { ethers } from 'ethers';
import { CacheManager } from '@vesper-discord/redis-service';
import { BlockchainService } from '../service';
import { NotProxyAddressError } from '../errors';

describe('blockchain-service | service | e2e', () => {
  describe('findImplementationAddressFromProxyAddress', () => {
    const proxyAddress = '0x01e1d41c1159b745298724c5fd3eaff3da1c6efd';

    beforeEach(async () => {
      Container.reset();

      await CacheManager.client?.del(
        `BlockchainService:findImplementationAddressFromProxyAddress:${ethers.constants.AddressZero}`,
      );
      await CacheManager.client?.del(
        `BlockchainService:findImplementationAddressFromProxyAddress:0x01e1d41c1159b745298724c5fd3eaff3da1c6efd`,
      );
    });

    it('should response with the correct address', async () => {
      const blockchainService = Container.get(BlockchainService);
      const expectedImplementationAddress = '0xfaed291aba8c0f7daae17c0176ccc398d9284fd5';
      const actualImplementationAddress = await blockchainService.findImplementationAddressFromProxyAddress(
        proxyAddress,
      );
      expect(actualImplementationAddress.toLowerCase()).toBe(expectedImplementationAddress.toLowerCase());
    });

    it('should throw NotProxyAddressError if it is not a proxy address', async () => {
      const blockchainService = Container.get(BlockchainService);
      await expect(() =>
        blockchainService.findImplementationAddressFromProxyAddress(ethers.constants.AddressZero),
      ).rejects.toThrow(NotProxyAddressError);
    });
  });
});
