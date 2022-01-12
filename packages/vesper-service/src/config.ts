import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  vspTokenAddress = this.getEnvVar<string>('VSP_TOKEN_ADDRESS', '0x1b40183efb4dd766f11bda7a7c3ad8982e998421');

  vvspTokenAddress = this.getEnvVar<string>('VESPER_VVSP_TOKEN_ADDRESS', '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc');
}
