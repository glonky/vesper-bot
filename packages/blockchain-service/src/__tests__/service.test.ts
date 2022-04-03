import { ethers } from 'ethers';
import Container from 'typedi';
import { NotProxyAddressError } from '../errors/not-proxy-address-error';
import { BlockchainService } from '../service';

describe('blockchain-service | service | e2e', () => {
  describe('findImplementationAddressFromProxyAddress', () => {
    it('should response with the correct address', async () => {
      const blockchainService = Container.get(BlockchainService);
      const proxyAddress = '0x01e1d41c1159b745298724c5fd3eaff3da1c6efd';
      const expectedImplementationAddress = '0xfaed291aba8c0f7daae17c0176ccc398d9284fd5';
      const actualImplementationAddress = await blockchainService.findImplementationAddressFromProxyAddress(
        proxyAddress,
      );
      expect(actualImplementationAddress.toLowerCase()).toBe(expectedImplementationAddress.toLowerCase());
    });

    it('should throw NotProxyAddressError if it is not a proxy address', async () => {
      const blockchainService = Container.get(BlockchainService);
      const proxyAddress = ethers.constants.AddressZero;

      await expect(() => blockchainService.findImplementationAddressFromProxyAddress(proxyAddress)).rejects.toThrow(
        NotProxyAddressError,
      );
    });
  });
});
