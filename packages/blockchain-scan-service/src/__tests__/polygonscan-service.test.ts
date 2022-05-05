import { EthereumBlockchainService } from '@vesper-discord/blockchain-service';
import { Container } from 'typedi';
import { EtherscanService } from '../etherscan-service';

describe.skip('polygonscan-service | e2e', () => {
  describe('getGasOracle', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const { result } = await etherscanService.getGasOracle();

      expect(result.FastGasPrice).toBeDefined();
      expect(result.ProposeGasPrice).toBeDefined();
      expect(result.SafeGasPrice).toBeDefined();
      expect(result.suggestBaseFee).toBeDefined();
    });
  });

  describe('getEstimationOfConfirmationTime', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const { result: gasOracleResult } = await etherscanService.getGasOracle();

      const { result } = await etherscanService.getEstimationOfConfirmationTime(gasOracleResult.FastGasPrice);

      expect(result).toBeDefined();
    });
  });

  describe('getListOfERC20TokenTransferEventsByAddress', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const { result } = await etherscanService.getListOfERC20TokenTransferEventsByAddress({
        address: '0x76d266dfd3754f090488ae12f6bd115cd7e77ebd',
        sort: 'desc',
      });

      expect(result).toHaveLength(50);
    });
  });

  describe('parseTransactionReceiptLogs', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const ethereumBlockchainService = Container.get(EthereumBlockchainService);
      const receipt = await ethereumBlockchainService.getTransactionReceipt(
        '0xdacecfa6f6ed7ae545b3895b99e953f9b5f90f6a31666da4bbc564558eec290c',
      );

      const parsedLogs = await etherscanService.parseTransactionReceiptLogs(receipt);

      expect(parsedLogs).toHaveLength(25);
      expect(parsedLogs[0]?.parsedLog).toBeDefined();
    }, 10000);
  });

  describe('getContractABIFromAddress', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const contractAbi = await etherscanService.getContractABIFromAddress({
        contractAddress: '0x01e1d41C1159b745298724c5Fd3eAfF3da1C6efD',
      });

      const parsedContractAbi = JSON.parse(contractAbi);
      expect(parsedContractAbi.find((fragment: any) => fragment.name === 'upgradeTo')).toBeDefined();
    });

    it('should respond with the correct result with followProxy', async () => {
      const etherscanService = Container.get(EtherscanService);
      const contractAbi = await etherscanService.getContractABIFromAddress({
        contractAddress: '0x01e1d41C1159b745298724c5Fd3eAfF3da1C6efD',
        followProxy: true,
      });

      const parsedContractAbi = JSON.parse(contractAbi);
      expect(parsedContractAbi.find((fragment: any) => fragment.name === 'upgradeTo')).toBeUndefined();
      expect(parsedContractAbi.find((fragment: any) => fragment.name === 'strategy')).toBeDefined();
    });
  });

  describe('getContractFromAddress', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const contract = await etherscanService.getContractFromAddress('0x01e1d41C1159b745298724c5Fd3eAfF3da1C6efD');

      const decimals = await contract.decimals.call();
      expect(decimals).toBe(18);
    });
  });

  describe('getERC20TokenTotalSupplyByContractAddress', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const { result } = await etherscanService.getERC20TokenTotalSupplyByContractAddress(
        '0x01e1d41C1159b745298724c5Fd3eAfF3da1C6efD',
      );

      expect(result).toBeDefined();
    });
  });

  describe('getERC20TokenAccountBalanceForTokenContractAddress', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const { result } = await etherscanService.getERC20TokenAccountBalanceForTokenContractAddress({
        address: '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc',
        contractAddress: '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
      });

      expect(result).toBeDefined();
    });
  });

  describe('getListOfNormalTransactionsByAddress', () => {
    it('should respond with the correct result', async () => {
      const etherscanService = Container.get(EtherscanService);
      const { result } = await etherscanService.getListOfNormalTransactionsByAddress({
        address: '0x9B11078F5e8345d074498a83C4f9824942F796d3',
        sort: 'desc',
      });
      expect(result).toHaveLength(45);
    });
  });
});
