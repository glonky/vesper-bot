import { PolygonBlockchainService } from '@vesper-discord/blockchain-service';
import { Container } from 'typedi';
import { PolygonScanService } from '../polygonscan-service';

describe('polygonscan-service | e2e', () => {
  describe('getGasOracle', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const { result } = await polygonScanService.getGasOracle();

      expect(result.FastGasPrice).toBeDefined();
      expect(result.ProposeGasPrice).toBeDefined();
      expect(result.SafeGasPrice).toBeDefined();
      expect(result.suggestBaseFee).toBeDefined();
    });
  });

  describe('getListOfERC20TokenTransferEventsByAddress', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const { result } = await polygonScanService.getListOfERC20TokenTransferEventsByAddress({
        address: '0x76d266dfd3754f090488ae12f6bd115cd7e77ebd',
        sort: 'desc',
      });

      expect(result.length).toBeGreaterThan(30);
    });
  });

  describe('parseTransactionReceiptLogs', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const polygonBlockchainService = Container.get(PolygonBlockchainService);
      const receipt = await polygonBlockchainService.getTransactionReceipt(
        '0x5073c1d27816d05da0ab0fe9951b9cd2fdc49d0050d12311ac5a4a062bb68979',
      );

      const parsedLogs = await polygonScanService.parseTransactionReceiptLogs(receipt);

      expect(parsedLogs).toHaveLength(3);
      expect(parsedLogs[0]?.parsedLog).toBeDefined();
    }, 10000);
  });

  describe('getContractABIFromAddress', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const contractAbi = await polygonScanService.getContractABIFromAddress({
        contractAddress: '0xD66FDcA0b120427C90C0318a454b37B88a3Aa40F',
      });

      const parsedContractAbi = JSON.parse(contractAbi);
      expect(parsedContractAbi.find((fragment: any) => fragment.name === 'upgradeTo')).toBeDefined();
    });

    it('should respond with the correct result with followProxy', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const contractAbi = await polygonScanService.getContractABIFromAddress({
        contractAddress: '0xD66FDcA0b120427C90C0318a454b37B88a3Aa40F',
        followProxy: true,
      });

      const parsedContractAbi = JSON.parse(contractAbi);
      expect(parsedContractAbi.find((fragment: any) => fragment.name === 'upgradeTo')).toBeUndefined();
      expect(parsedContractAbi.find((fragment: any) => fragment.name === 'strategy')).toBeDefined();
    });
  });

  describe('getContractFromAddress', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const contract = await polygonScanService.getContractFromAddress('0xD66FDcA0b120427C90C0318a454b37B88a3Aa40F');

      const decimals = await contract.decimals.call();
      expect(decimals).toBe(18);
    });
  });

  describe('getERC20TokenTotalSupplyByContractAddress', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const { result } = await polygonScanService.getERC20TokenTotalSupplyByContractAddress(
        '0xD66FDcA0b120427C90C0318a454b37B88a3Aa40F',
      );

      expect(result).toBeDefined();
    });
  });

  describe('getERC20TokenAccountBalanceForTokenContractAddress', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const { result } = await polygonScanService.getERC20TokenAccountBalanceForTokenContractAddress({
        address: '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc',
        contractAddress: '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
      });

      expect(result).toBeDefined();
    });
  });

  describe('getListOfNormalTransactionsByAddress', () => {
    it('should respond with the correct result', async () => {
      const polygonScanService = Container.get(PolygonScanService);
      const { result } = await polygonScanService.getListOfNormalTransactionsByAddress({
        address: '0xD66FDcA0b120427C90C0318a454b37B88a3Aa40F',
        sort: 'desc',
      });
      expect(result.length).toBeGreaterThan(200);
    });
  });
});
