import 'reflect-metadata';
import '@nomiclabs/hardhat-waffle';
import { HardhatUserConfig } from 'hardhat/types';
import Container from 'typedi';
import { Config } from './config';

const config = Container.get(Config);

console.log(config);
const hardhatConfig: HardhatUserConfig = {
  networks: {
    [config.network]: {
      accounts: [config.infura.project.secret],
      // url: `https://${config.network}.infura.io/v3/${config.infura.project.id}`,
    },
  },
  solidity: {
    compilers: [{ settings: {}, version: '0.6.8' }],
  },
};
export default hardhatConfig;
